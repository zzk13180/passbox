import { Injectable } from '@angular/core'
import * as pako from 'pako'
import { EncryptionType } from '../enums/encryptionType'
import { StorageKey } from '../enums/storageKey'
import { CipherString } from '../models/domain/cipherString'
import { EncryptedObject } from '../models/domain/encryptedObject'
import { SymmetricCryptoKey } from '../models/domain/symmetricCryptoKey'
import { CryptoService as CryptoServiceAbstraction } from '../models/abstractions/crypto.service'
import { Utils } from '../misc/utils'
import { CryptoFunctionService } from './cryptoFunction.service'
import { ElectronService } from './electron.service'

@Injectable({
  providedIn: 'root',
})
export class CryptoService implements CryptoServiceAbstraction {
  private legacyEtmKey: SymmetricCryptoKey
  private password: ArrayBuffer | null = null
  private salt: ArrayBuffer | null = null

  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private electronService: ElectronService,
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

  private async init(userPassword?: string): Promise<void> {
    let password = null
    let salt = null
    const passwordStr = await this.electronService.storageGet(StorageKey.password)
    const saltStr = await this.electronService.storageGet(StorageKey.salt)
    if (passwordStr && saltStr) {
      password = new ArrayBuffer(14)
      passwordStr
        .split(',')
        .map((item, i) => new DataView(password).setUint8(i, Number(item)))
      salt = new ArrayBuffer(21)
      saltStr.split(',').map((item, i) => new DataView(salt).setUint8(i, Number(item)))
    } else {
      const bytes = await this.cryptoFunctionService.randomBytes(35)
      password = bytes.slice(0, 14)
      salt = bytes.slice(14, 35)
      let s1 = ''
      let s2 = ''
      const arr = new Uint8Array(bytes)
      for (let i = 0; i < arr.byteLength; i++) {
        if (i < 14) {
          s1 += `${arr[i]}${i === 13 ? '' : ','}`
        } else {
          s2 += `${arr[i]}${i === 34 ? '' : ','}`
        }
      }
      await this.electronService.storageSave(StorageKey.password, s1)
      await this.electronService.storageSave(StorageKey.salt, s2)
    }
    if (userPassword) {
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

  // Prevent files storing user data from being deleted while the program is running
  // Check whether the file storing user data exists before each decryption
  private async fileExists(): Promise<boolean> {
    const saltStr = await this.electronService.storageGet(StorageKey.salt)
    return !!saltStr != null
  }

  private async checkPassword(password?: string): Promise<void> {
    const isExist = await this.fileExists()
    if (!this.password || !this.salt || !isExist || password) {
      this.password = null
      this.salt = null
      await this.init(password)
    }
  }

  async encrypt(
    plainValue: string | ArrayBuffer,
    password?: string,
  ): Promise<CipherString> {
    if (plainValue == null) {
      return Promise.resolve(null)
    }
    await this.checkPassword(password)

    let plainBuf: ArrayBuffer
    if (typeof plainValue === 'string') {
      plainBuf = pako.deflate(plainValue).buffer
    } else {
      plainBuf = plainValue
    }

    const encObj = await this.aesEncrypt(plainBuf)
    const iv = Utils.fromBufferToB64(encObj.iv)
    const data = Utils.fromBufferToB64(encObj.data)
    const mac = encObj.mac != null ? Utils.fromBufferToB64(encObj.mac) : null
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
}
