import { Injectable } from '@angular/core'
import { EncryptionType } from '../enums/encryptionType'
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

  private async init(): Promise<void> {
    let password = null
    let salt = null
    const passwordStr = await this.electronService.storageGet('password')
    const saltStr = await this.electronService.storageGet('salt')
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
      await this.electronService.storageSave('password', s1)
      await this.electronService.storageSave('salt', s2)
    }
    this.password = password
    this.salt = salt
  }

  async encrypt(plainValue: string | ArrayBuffer): Promise<CipherString> {
    if (plainValue == null) {
      return Promise.resolve(null)
    }
    if (!this.password || !this.salt) {
      await this.init()
    }

    let plainBuf: ArrayBuffer
    if (typeof plainValue === 'string') {
      plainBuf = Utils.fromUtf8ToArray(plainValue).buffer
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
    if (!this.password || !this.salt) {
      await this.init()
    }
    const result = await this.aesDecryptToUtf8(
      cipherString.encryptionType,
      cipherString.data,
      cipherString.iv,
      cipherString.mac,
    )
    return result
  }

  async randomNumber(min: number, max: number): Promise<number> {
    let rval = 0
    const range = max - min + 1
    const bitsNeeded = Math.ceil(Math.log2(range))
    if (bitsNeeded > 53) {
      throw new Error('We cannot generate numbers larger than 53 bits.')
    }

    const bytesNeeded = Math.ceil(bitsNeeded / 8)
    const mask = Math.pow(2, bitsNeeded) - 1

    const byteArray = new Uint8Array(
      await this.cryptoFunctionService.randomBytes(bytesNeeded),
    )

    let p = (bytesNeeded - 1) * 8
    for (let i = 0; i < bytesNeeded; i++) {
      rval += byteArray[i] * Math.pow(2, p)
      p -= 8
    }

    // eslint-disable-next-line no-bitwise
    rval &= mask

    if (rval >= range) {
      return this.randomNumber(min, max)
    }

    return min + rval
  }
}
