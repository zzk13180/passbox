import { Injectable } from '@angular/core'
import { CryptoService } from './crypto.service'
import { ElectronService } from './electron.service'
import { CryptoFunctionService } from './cryptoFunction.service'

@Injectable({
  providedIn: 'root',
})
export class DbService {
  storagePrefix = 'password-manager:'
  servicePrefix = 'db:'

  constructor(
    private cryptoService: CryptoService,
    private electronService: ElectronService,
    private cryptoFunctionService: CryptoFunctionService,
  ) {
    this.init()
  }

  private async init() {
    let password = null
    let salt = null
    const textDecoder = new TextDecoder('utf-8')
    const textEncoder = new TextEncoder()
    const passwordStr = await this.electronService.storageGet('password')
    const saltStr = await this.electronService.storageGet('salt')
    if (passwordStr && saltStr) {
      password = textEncoder.encode(passwordStr).buffer
      salt = textEncoder.encode(saltStr).buffer
    } else {
      password = await this.cryptoFunctionService.randomBytes(14)
      salt = await this.cryptoFunctionService.randomBytes(21)
      await this.electronService.storageSave('password', textDecoder.decode(password))
      await this.electronService.storageSave('salt', textDecoder.decode(salt))
      this.cryptoService.init(password, salt)
    }
  }

  async getItemByExactKey(key: string): Promise<any> {
    const result = await this.electronService.storageGet(key).then(async result => {
      if (result && JSON.parse(result).value) {
        const decrypted = await this.cryptoService.decryptToUtf8(JSON.parse(result).value)
        return Promise.resolve(JSON.parse(decrypted))
      } else {
        return Promise.resolve(null)
      }
    })
    return result
  }

  async getItem(key: string): Promise<any> {
    const result = await this.getItemByExactKey(this.getItemName(key))
    return result
  }

  async setItem(key: string, value: any): Promise<any> {
    const dbValue = {
      value: null,
    }
    if (key && value) {
      const result = await this.cryptoService
        .encrypt(JSON.stringify(value))
        .then(async encrypted => {
          dbValue.value = encrypted
          await this.electronService.storageSave(
            this.getItemName(key),
            JSON.stringify(dbValue),
          )
          return value
        })
      return result
    }
    return Promise.resolve(null)
  }

  private getItemName(key: string) {
    return `${this.storagePrefix}${this.servicePrefix}${key}`
  }
}
