import { Injectable } from '@angular/core'
import { CryptoService } from './crypto.service'
import { ElectronService } from './electron.service'

@Injectable({
  providedIn: 'root',
})
export class DbService {
  storagePrefix = 'password-manager:'
  servicePrefix = 'db:'

  constructor(
    private cryptoService: CryptoService,
    private electronService: ElectronService,
  ) {}

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
