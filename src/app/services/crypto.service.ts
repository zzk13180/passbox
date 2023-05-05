import { Injectable } from '@angular/core'
import * as pako from 'pako'
import { EncryptionType } from '../enums/encryptionType'
import { CipherString } from '../models/domain/cipherString'
import { EncryptedObject } from '../models/domain/encryptedObject'
import { SymmetricCryptoKey } from '../models/domain/symmetricCryptoKey'
import { CryptoService as CryptoServiceAbstraction } from '../models/abstractions/crypto.service'
import { CryptoUtils } from '../utils/crypto.util'
import { CryptoFunctionService } from './cryptoFunction.service'
import { UserStateService } from './userstate.service'
import type { UserState } from './userstate.service'

@Injectable({
  providedIn: 'root',
})
export class CryptoService implements CryptoServiceAbstraction {
  private legacyEtmKey: SymmetricCryptoKey
  private password: ArrayBuffer | null = null
  private salt: ArrayBuffer | null = null

  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private userStateService: UserStateService,
  ) {}

  private async makeKey(): Promise<SymmetricCryptoKey> {
    const key: ArrayBuffer = await this.cryptoFunctionService.pbkdf2(
      this.password,
      this.salt,
      'sha256',
      5000,
    )
    return new SymmetricCryptoKey(key)
  }

  private async aesEncrypt(data: ArrayBuffer): Promise<EncryptedObject> {
    const obj = new EncryptedObject()
    obj.key = await this.makeKey()
    obj.iv = await this.cryptoFunctionService.randomBytes(16)
    obj.data = await this.cryptoFunctionService.aesEncrypt(data, obj.iv, obj.key.encKey)

    if (obj.key.macKey != null) {
      const macData = new Uint8Array(obj.iv.byteLength + obj.data.byteLength)
      macData.set(new Uint8Array(obj.iv), 0)
      macData.set(new Uint8Array(obj.data), obj.iv.byteLength)
      obj.mac = await this.cryptoFunctionService.hmac(
        macData.buffer,
        obj.key.macKey,
        'sha256',
      )
    }

    return obj
  }

  private resolveLegacyKey(
    encType: EncryptionType,
    key: SymmetricCryptoKey,
  ): SymmetricCryptoKey {
    if (
      encType === EncryptionType.AesCbc128_HmacSha256_B64 &&
      key.encType === EncryptionType.AesCbc256_B64
    ) {
      if (this.legacyEtmKey == null) {
        this.legacyEtmKey = new SymmetricCryptoKey(
          key.key,
          EncryptionType.AesCbc128_HmacSha256_B64,
        )
      }
      return this.legacyEtmKey
    }

    return key
  }

  private async aesDecryptToUtf8(
    encType: EncryptionType,
    data: string,
    iv: string,
    mac: string,
  ): Promise<string> {
    const keyForEnc = await this.makeKey()
    const theKey = this.resolveLegacyKey(encType, keyForEnc)

    if (theKey.macKey != null && mac == null) {
      return null
    }

    if (theKey.encType !== encType) {
      return null
    }

    const fastParams = this.cryptoFunctionService.aesDecryptFastParameters(
      data,
      iv,
      mac,
      theKey,
    )
    if (fastParams.macKey != null && fastParams.mac != null) {
      const computedMac = await this.cryptoFunctionService.hmacFast(
        fastParams.macData,
        fastParams.macKey,
        'sha256',
      )
      const macsEqual = await this.cryptoFunctionService.compareFast(
        fastParams.mac,
        computedMac,
      )
      if (!macsEqual) {
        return null
      }
    }

    return this.cryptoFunctionService.aesDecryptFast(fastParams)
  }

  private initPassword(userstate: UserState, userPassword?: string): void {
    const { password: passwordStr, salt: saltStr, isRequiredLogin } = userstate

    const salt = new ArrayBuffer(21)
    saltStr.split(',').map((item, i) => new DataView(salt).setUint8(i, Number(item)))

    let password = new ArrayBuffer(14)
    passwordStr
      .split(',')
      .map((item, i) => new DataView(password).setUint8(i, Number(item)))

    if (isRequiredLogin && userPassword) {
      const encoder = new TextEncoder()
      const userPasswordBuffer = encoder.encode(userPassword).buffer
      const tmp = new Uint8Array(password.byteLength + userPasswordBuffer.byteLength)
      tmp.set(new Uint8Array(userPasswordBuffer), 0)
      tmp.set(new Uint8Array(password), userPasswordBuffer.byteLength)
      password = tmp.buffer.slice(0, 14)
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
    const iv = CryptoUtils.fromBufferToB64(encObj.iv)
    const data = CryptoUtils.fromBufferToB64(encObj.data)
    const mac = encObj.mac != null ? CryptoUtils.fromBufferToB64(encObj.mac) : null
    return new CipherString(encObj.key.encType, data, iv, mac)
  }

  async decryptToUtf8(cipherString: CipherString): Promise<string> {
    await this.checkPassword()
    const result = await this.aesDecryptToUtf8(
      cipherString.encryptionType,
      cipherString.data,
      cipherString.iv,
      cipherString.mac,
    )
    return result
  }

  async decryptToUtf8WithExternalUserState(
    cipherString: CipherString,
    userState: UserState,
    userPassword?: string,
  ): Promise<string> {
    this.initPassword(userState, userPassword)
    const result = await this.aesDecryptToUtf8(
      cipherString.encryptionType,
      cipherString.data,
      cipherString.iv,
      cipherString.mac,
    )
    return result
  }
}
