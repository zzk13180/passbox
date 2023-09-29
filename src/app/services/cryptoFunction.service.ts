import * as pako from 'pako'
import { Injectable } from '@angular/core'
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from '../models/abstractions/cryptoFunction.service'
import { fromB64ToArray, fromUtf8ToArray } from '../utils/crypto.util'
import { DecryptParameters } from '../models/domain/decryptParameters'

@Injectable({
  providedIn: 'root',
})
export class CryptoFunctionService implements CryptoFunctionServiceAbstraction {
  private crypto = window.electronAPI.crypto

  constructor() {}

  async pbkdf2(
    password: string | ArrayBuffer,
    salt: string | ArrayBuffer,
    algorithm: 'sha256' | 'sha512',
    iterations: number,
  ): Promise<ArrayBuffer> {
    const len = algorithm === 'sha256' ? 32 : 64
    const nodePassword = this.toNodeValue(password)
    const nodeSalt = this.toNodeValue(salt)
    const key = await this.crypto.pbkdf2Sync(
      nodePassword,
      nodeSalt,
      iterations,
      len,
      algorithm,
    )
    return this.toArrayBuffer(key)
  }

  async aesEncrypt(
    data: ArrayBuffer,
    iv: ArrayBuffer,
    key: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    const nodeData = this.toNodeBuffer(data)
    const nodeIv = this.toNodeBuffer(iv)
    const nodeKey = this.toNodeBuffer(key)
    const encBuf = await this.crypto.createCipheriv(
      'aes-256-cbc',
      nodeKey,
      nodeIv,
      nodeData,
    )
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

  private async aesDecrypt(
    data: ArrayBuffer,
    iv: ArrayBuffer,
    key: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    const nodeData = this.toNodeBuffer(data)
    const nodeIv = this.toNodeBuffer(iv)
    const nodeKey = this.toNodeBuffer(key)
    const decBuf = await this.crypto.createDecipheriv(
      'aes-256-cbc',
      nodeKey,
      nodeIv,
      nodeData,
    )
    return this.toArrayBuffer(decBuf)
  }

  async randomBytes(length: number): Promise<ArrayBuffer> {
    const bytes = await this.crypto.randomBytes(length)
    return this.toArrayBuffer(bytes)
  }

  private toNodeValue(value: string | ArrayBuffer): string | Uint8Array {
    let nodeValue: string | Uint8Array
    if (typeof value === 'string') {
      nodeValue = value
    } else {
      nodeValue = this.toNodeBuffer(value)
    }
    return nodeValue
  }

  private toNodeBuffer(value: ArrayBuffer): Uint8Array {
    return new Uint8Array(value)
  }

  private toArrayBuffer(value: string | ArrayBuffer | Uint8Array): ArrayBuffer {
    let buf: ArrayBuffer
    if (typeof value === 'string') {
      buf = fromUtf8ToArray(value).buffer
    } else {
      buf = new Uint8Array(value).buffer
    }
    return buf
  }
}
