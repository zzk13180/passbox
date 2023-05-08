import * as Crypto from 'node:crypto'
import * as pako from 'pako'
import { Injectable } from '@angular/core'
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from '../models/abstractions/cryptoFunction.service'
import { fromB64ToArray, fromUtf8ToArray } from '../utils/crypto.util'
import { DecryptParameters } from '../models/domain/decryptParameters'

@Injectable({
  providedIn: 'root',
})
export class CryptoFunctionService implements CryptoFunctionServiceAbstraction {
  crypto: typeof Crypto

  constructor() {
    this.crypto = window.require('node:crypto')
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
    key: ArrayBuffer,
  ): DecryptParameters<ArrayBuffer> {
    const p = new DecryptParameters<ArrayBuffer>()
    p.encKey = key
    p.data = fromB64ToArray(data).buffer
    p.iv = fromB64ToArray(iv).buffer

    const macData = new Uint8Array(p.iv.byteLength + p.data.byteLength)
    macData.set(new Uint8Array(p.iv), 0)
    macData.set(new Uint8Array(p.data), p.iv.byteLength)
    p.macData = macData.buffer
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

  private aesDecrypt(
    data: ArrayBuffer,
    iv: ArrayBuffer,
    key: ArrayBuffer,
  ): Promise<ArrayBuffer> {
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
      buf = fromUtf8ToArray(value).buffer
    } else {
      buf = new Uint8Array(value).buffer
    }
    return buf
  }
}
