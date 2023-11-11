import pako from 'pako'
import { fromB64ToArray, fromUtf8ToArray } from '../utils/crypto.util'
import { DecryptParameters } from '../models'

export class CryptoFunctionService {
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
    dataStr: string,
    ivStr: string,
    key: ArrayBuffer,
  ): DecryptParameters<ArrayBuffer> {
    const encKey = key
    const data = fromB64ToArray(dataStr).buffer
    const iv = fromB64ToArray(ivStr).buffer
    const macDataUint8Array = new Uint8Array(iv.byteLength + data.byteLength)
    macDataUint8Array.set(new Uint8Array(iv), 0)
    macDataUint8Array.set(new Uint8Array(data), iv.byteLength)
    const macData = macDataUint8Array.buffer
    return {
      encKey,
      data,
      iv,
      macData,
    }
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
