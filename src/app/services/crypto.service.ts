import { Injectable } from '@angular/core'
import pako from 'pako'
import { fromBufferToB64, areArrayBuffersEqual, randomBytes } from '../utils/crypto.util'
import { CryptoFunctionService } from './crypto-function.service'
import { UserStateService } from './user-state.service'
import type { CipherString, EncryptedObject, UserState } from '../models'

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private iterations: number | null = null
  private password: ArrayBuffer | null = null
  private salt: ArrayBuffer | null = null
  private key: ArrayBuffer | null = null
  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private userStateService: UserStateService,
  ) {}

  async encrypt(plainValue: string | ArrayBuffer): Promise<CipherString> {
    const userstate: UserState = await this.userStateService.getUserState()
    const userPassword = this.userStateService.getUserPassword()
    const { password, salt, iterations } = this.getPasswordAndSaltAndIterations(
      userstate,
      userPassword,
    )
    if (
      !this.iterations ||
      !this.password ||
      !this.salt ||
      !areArrayBuffersEqual(this.password, password) ||
      !areArrayBuffersEqual(this.salt, salt)
    ) {
      this.iterations = iterations
      this.password = password
      this.salt = salt
      this.key = await this.makeKey(password, salt, iterations)
    }

    let plainBuf: ArrayBuffer
    if (typeof plainValue === 'string') {
      plainBuf = pako.deflate(plainValue).buffer
    } else {
      plainBuf = plainValue
    }

    const encObj = await this.aesEncrypt(plainBuf, this.key)
    const iv = fromBufferToB64(encObj.iv)
    const data = fromBufferToB64(encObj.data)
    return { data, iv }
  }

  async encryptWithExternalUserPassword(
    plainValue: string | ArrayBuffer,
    userPassword: string,
  ): Promise<CipherString> {
    const userstate: UserState = await this.userStateService.getUserState()
    const { password, salt, iterations } = this.getPasswordAndSaltAndIterations(
      userstate,
      userPassword,
    )
    const key = await this.makeKey(password, salt, iterations)

    let plainBuf: ArrayBuffer
    if (typeof plainValue === 'string') {
      plainBuf = pako.deflate(plainValue).buffer
    } else {
      plainBuf = plainValue
    }

    const encObj = await this.aesEncrypt(plainBuf, key)
    const iv = fromBufferToB64(encObj.iv)
    const data = fromBufferToB64(encObj.data)
    return { data, iv }
  }

  async decryptToUtf8(cipherString: CipherString): Promise<string> {
    const userstate: UserState = await this.userStateService.getUserState()
    const userPassword = this.userStateService.getUserPassword()
    const { password, salt, iterations } = this.getPasswordAndSaltAndIterations(
      userstate,
      userPassword,
    )
    if (
      !this.iterations ||
      !this.password ||
      !this.salt ||
      !areArrayBuffersEqual(this.password, password) ||
      !areArrayBuffersEqual(this.salt, salt)
    ) {
      this.password = password
      this.salt = salt
      this.key = await this.makeKey(password, salt, iterations)
    }
    const result = await this.aesDecryptToUtf8(
      cipherString.data,
      cipherString.iv,
      this.key,
    )
    return result
  }

  async decryptToUtf8WithExternalUserState(
    cipherString: CipherString,
    userState: UserState,
    userPassword?: string,
  ): Promise<string> {
    const { password, salt, iterations } = this.getPasswordAndSaltAndIterations(
      userState,
      userPassword,
    )
    const key = await this.makeKey(password, salt, iterations)

    const result = await this.aesDecryptToUtf8(cipherString.data, cipherString.iv, key)
    return result
  }

  private async makeKey(
    password: ArrayBuffer,
    salt: ArrayBuffer,
    iterations: number,
  ): Promise<ArrayBuffer> {
    const key: ArrayBuffer = await this.cryptoFunctionService.pbkdf2(
      password,
      salt,
      'sha256',
      iterations,
    )
    return key
  }

  private async aesEncrypt(
    arrayBuffer: ArrayBuffer,
    key: ArrayBuffer,
  ): Promise<EncryptedObject> {
    const iv = randomBytes(16)
    const data = await this.cryptoFunctionService.aesEncrypt(arrayBuffer, iv, key)
    return { iv, data, key }
  }

  private aesDecryptToUtf8(data: string, iv: string, key: ArrayBuffer): Promise<string> {
    const fastParams = this.cryptoFunctionService.aesDecryptFastParameters(data, iv, key)
    return this.cryptoFunctionService.aesDecryptFast(fastParams)
  }

  private getPasswordAndSaltAndIterations(
    userstate: UserState,
    userPassword?: string,
  ): {
    password: ArrayBuffer
    salt: ArrayBuffer
    iterations: number
  } {
    const {
      password: passwordStr,
      salt: saltStr,
      isRequiredLogin,
      passwordEncryptionStrength,
    } = userstate

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

    return { password, salt, iterations: passwordEncryptionStrength }
  }
}
