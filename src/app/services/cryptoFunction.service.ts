import * as Crypto from 'crypto'
import { Injectable } from '@angular/core'
import * as pako from 'pako'
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from '../models/abstractions/cryptoFunction.service'
import { Utils } from '../misc/utils'
import { DecryptParameters } from '../models/domain/decryptParameters'
import { SymmetricCryptoKey } from '../models/domain/symmetricCryptoKey'

@Injectable({
  providedIn: 'root',
})
export class CryptoFunctionService implements CryptoFunctionServiceAbstraction {
  crypto: typeof Crypto

  constructor() {
    this.crypto = window.require('crypto')
  }

  pbkdf2(
    password: string | ArrayBuffer,
    salt: string | ArrayBuffer,
    algorithm: 'sha256' | 'sha512',
    iterations: number,
  ): Promise<ArrayBuffer> {
    const len = algorithm === 'sha256' ? 32 : 64
    const nodePassword = this.toNodeValue(password)
    const nodeSalt = this.toNodeValue(salt)
    return new Promise<ArrayBuffer>((resolve, reject) => {
      this.crypto.pbkdf2(
        nodePassword,
        nodeSalt,
        iterations,
        len,
        algorithm,
        (error, key) => {
          if (error != null) {
            reject(error)
          } else {
            resolve(this.toArrayBuffer(key))
          }
        },
      )
    })
  }

  // eslint-disable-next-line max-params
  async hkdf(
    ikm: ArrayBuffer,
    salt: string | ArrayBuffer,
    info: string | ArrayBuffer,
    outputByteSize: number,
    algorithm: 'sha256' | 'sha512',
  ): Promise<ArrayBuffer> {
    const saltBuf = this.toArrayBuffer(salt)
    const prk = await this.hmac(ikm, saltBuf, algorithm)
    return this.hkdfExpand(prk, info, outputByteSize, algorithm)
  }

  // ref: https://tools.ietf.org/html/rfc5869
  async hkdfExpand(
    prk: ArrayBuffer,
    info: string | ArrayBuffer,
    outputByteSize: number,
    algorithm: 'sha256' | 'sha512',
  ): Promise<ArrayBuffer> {
    const hashLen = algorithm === 'sha256' ? 32 : 64
    if (outputByteSize > 255 * hashLen) {
      throw new Error('outputByteSize is too large.')
    }
    const prkArr = new Uint8Array(prk)
    if (prkArr.length < hashLen) {
      throw new Error('prk is too small.')
    }
    const infoBuf = this.toArrayBuffer(info)
    const infoArr = new Uint8Array(infoBuf)
    let runningOkmLength = 0
    let previousT = new Uint8Array(0)
    const n = Math.ceil(outputByteSize / hashLen)
    const okm = new Uint8Array(n * hashLen)
    for (let i = 0; i < n; i++) {
      const t = new Uint8Array(previousT.length + infoArr.length + 1)
      t.set(previousT)
      t.set(infoArr, previousT.length)
      t.set([i + 1], t.length - 1)
      previousT = new Uint8Array(await this.hmac(t.buffer, prk, algorithm))
      okm.set(previousT, runningOkmLength)
      runningOkmLength += previousT.length
      if (runningOkmLength >= outputByteSize) {
        break
      }
    }
    return okm.slice(0, outputByteSize).buffer
  }

  hash(
    value: string | ArrayBuffer,
    algorithm: 'sha1' | 'sha256' | 'sha512' | 'md5',
  ): Promise<ArrayBuffer> {
    const nodeValue = this.toNodeValue(value)
    const hash = this.crypto.createHash(algorithm)
    hash.update(nodeValue)
    return Promise.resolve(this.toArrayBuffer(hash.digest()))
  }

  hmac(
    value: ArrayBuffer,
    key: ArrayBuffer,
    algorithm: 'sha1' | 'sha256' | 'sha512',
  ): Promise<ArrayBuffer> {
    const nodeValue = this.toNodeBuffer(value)
    const nodeKey = this.toNodeBuffer(key)
    const hmac = this.crypto.createHmac(algorithm, nodeKey)
    hmac.update(nodeValue)
    return Promise.resolve(this.toArrayBuffer(hmac.digest()))
  }

  async compare(a: ArrayBuffer, b: ArrayBuffer): Promise<boolean> {
    const key = await this.randomBytes(32)
    const mac1 = await this.hmac(a, key, 'sha256')
    const mac2 = await this.hmac(b, key, 'sha256')
    if (mac1.byteLength !== mac2.byteLength) {
      return false
    }
    const arr1 = new Uint8Array(mac1)
    const arr2 = new Uint8Array(mac2)
    for (let i = 0; i < arr2.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false
      }
    }
    return true
  }

  hmacFast(
    value: ArrayBuffer,
    key: ArrayBuffer,
    algorithm: 'sha1' | 'sha256' | 'sha512',
  ): Promise<ArrayBuffer> {
    return this.hmac(value, key, algorithm)
  }

  compareFast(a: ArrayBuffer, b: ArrayBuffer): Promise<boolean> {
    return this.compare(a, b)
  }

  aesEncrypt(data: ArrayBuffer, iv: ArrayBuffer, key: ArrayBuffer): Promise<ArrayBuffer> {
    const nodeData = this.toNodeBuffer(data)
    const nodeIv = this.toNodeBuffer(iv)
    const nodeKey = this.toNodeBuffer(key)
    const cipher = this.crypto.createCipheriv('aes-256-cbc', nodeKey, nodeIv)
    const encBuf = Buffer.concat([cipher.update(nodeData), cipher.final()])
    return Promise.resolve(this.toArrayBuffer(encBuf))
  }

  aesDecryptFastParameters(
    data: string,
    iv: string,
    mac: string,
    key: SymmetricCryptoKey,
  ): DecryptParameters<ArrayBuffer> {
    const p = new DecryptParameters<ArrayBuffer>()
    p.encKey = key.encKey
    p.data = Utils.fromB64ToArray(data).buffer
    p.iv = Utils.fromB64ToArray(iv).buffer

    const macData = new Uint8Array(p.iv.byteLength + p.data.byteLength)
    macData.set(new Uint8Array(p.iv), 0)
    macData.set(new Uint8Array(p.data), p.iv.byteLength)
    p.macData = macData.buffer

    if (key.macKey != null) {
      p.macKey = key.macKey
    }
    if (mac != null) {
      p.mac = Utils.fromB64ToArray(mac).buffer
    }

    return p
  }

  async aesDecryptFast(parameters: DecryptParameters<ArrayBuffer>): Promise<string> {
    const decBuf = await this.aesDecrypt(
      parameters.data,
      parameters.iv,
      parameters.encKey,
    )
    return pako.inflate(decBuf, { to: 'string' })
  }

  aesDecrypt(data: ArrayBuffer, iv: ArrayBuffer, key: ArrayBuffer): Promise<ArrayBuffer> {
    const nodeData = this.toNodeBuffer(data)
    const nodeIv = this.toNodeBuffer(iv)
    const nodeKey = this.toNodeBuffer(key)
    const decipher = this.crypto.createDecipheriv('aes-256-cbc', nodeKey, nodeIv)
    const decBuf = Buffer.concat([decipher.update(nodeData), decipher.final()])
    return Promise.resolve(this.toArrayBuffer(decBuf))
  }

  randomBytes(length: number): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      this.crypto.randomBytes(length, (error, bytes) => {
        if (error != null) {
          reject(error)
        } else {
          resolve(this.toArrayBuffer(bytes))
        }
      })
    })
  }

  private toNodeValue(value: string | ArrayBuffer): string | Buffer {
    let nodeValue: string | Buffer
    if (typeof value === 'string') {
      nodeValue = value
    } else {
      nodeValue = this.toNodeBuffer(value)
    }
    return nodeValue
  }

  private toNodeBuffer(value: ArrayBuffer): Buffer {
    return Buffer.from(new Uint8Array(value) as any)
  }

  private toArrayBuffer(value: Buffer | string | ArrayBuffer): ArrayBuffer {
    let buf: ArrayBuffer
    if (typeof value === 'string') {
      buf = Utils.fromUtf8ToArray(value).buffer
    } else {
      buf = new Uint8Array(value).buffer
    }
    return buf
  }
}
