import { Injectable } from '@angular/core'
import * as pako from 'pako'
import { CipherString, EncryptedObject } from '../models'

import { fromBufferToB64 } from '../utils/crypto.util'
import { CryptoFunctionService } from './crypto-function.service'
import { UserStateService } from './user-state.service'
import type { UserState } from './user-state.service'

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private password: ArrayBuffer | null = null
  private salt: ArrayBuffer | null = null

  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private userStateService: UserStateService,
  ) {}

  private async makeKey(): Promise<ArrayBuffer> {
    const key: ArrayBuffer = await this.cryptoFunctionService.pbkdf2(
      this.password,
      this.salt,
      'sha256',
      5000,
    )
    return key
  }

  private async aesEncrypt(arrayBuffer: ArrayBuffer): Promise<EncryptedObject> {
    const key = await this.makeKey()
    const iv = await this.cryptoFunctionService.randomBytes(16)
    const data = await this.cryptoFunctionService.aesEncrypt(arrayBuffer, iv, key)
    return { iv, data, key }
  }

  private async aesDecryptToUtf8(data: string, iv: string): Promise<string> {
    const keyForEnc = await this.makeKey()

    const fastParams = this.cryptoFunctionService.aesDecryptFastParameters(
      data,
      iv,
      keyForEnc,
    )

    return this.cryptoFunctionService.aesDecryptFast(fastParams)
  }

  private initPassword(userstate: UserState, userPassword?: string): void {
    const { password: passwordStr, salt: saltStr, isRequiredLogin } = userstate

    const salt = new ArrayBuffer(23)
    saltStr.split(',').map((item, i) => new DataView(salt).setUint8(i, Number(item)))

    let password = new ArrayBuffer(64)
    passwordStr
      .split(',')
      .map((item, i) => new DataView(password).setUint8(i, Number(item)))

    if (isRequiredLogin && userPassword) {
      const encoder = new TextEncoder()
      const userPasswordBuffer = encoder.encode(userPassword).buffer
      const tmp = new Uint8Array(password.byteLength + userPasswordBuffer.byteLength)
      tmp.set(new Uint8Array(userPasswordBuffer), 0)
      tmp.set(new Uint8Array(password), userPasswordBuffer.byteLength)
      password = tmp.buffer.slice(0, 64)
    }

    this.password = password
    this.salt = salt
  }

  private async checkPassword(): Promise<void> {
    const userstate: UserState = await this.userStateService.getUserState()
    const userPassword = this.userStateService.getUserPassword()
    this.initPassword(userstate, userPassword)
  }

  async encrypt(plainValue: string | ArrayBuffer): Promise<CipherString> {
    if (plainValue == null) {
      return Promise.resolve(null)
    }
    await this.checkPassword()

    let plainBuf: ArrayBuffer
    if (typeof plainValue === 'string') {
      plainBuf = pako.deflate(plainValue).buffer
    } else {
      plainBuf = plainValue
    }

    const encObj = await this.aesEncrypt(plainBuf)
    const iv = fromBufferToB64(encObj.iv)
    const data = fromBufferToB64(encObj.data)
    return { data, iv }
  }

  async decryptToUtf8(cipherString: CipherString): Promise<string> {
    await this.checkPassword()
    const result = await this.aesDecryptToUtf8(cipherString.data, cipherString.iv)
    return result
  }

  async decryptToUtf8WithExternalUserState(
    cipherString: CipherString,
    userState: UserState,
    userPassword?: string,
  ): Promise<string> {
    this.initPassword(userState, userPassword)
    const result = await this.aesDecryptToUtf8(cipherString.data, cipherString.iv)
    return result
  }
}
