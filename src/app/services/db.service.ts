import { Injectable } from '@angular/core'
import { CryptoService } from './crypto.service'
import { ElectronService } from './electron.service'

@Injectable({
  providedIn: 'root',
})
export class DbService {
  constructor(
    private cryptoService: CryptoService,
    private electronService: ElectronService,
  ) {}

  private async getItemByExactKey(key: string): Promise<any> {
    const result = await this.electronService.storageGet(key).then(async result => {
      if (!result) {
        return Promise.resolve(null)
      }
      const { value } = JSON.parse(result)
      if (result && value) {
        const decrypted = await this.cryptoService.decryptToUtf8(value)
        return Promise.resolve(JSON.parse(decrypted))
      } else {
        return Promise.resolve(null)
      }
    })
    return result
  }

  async getEncryptedData(key: string): Promise<any> {
    const result = await this.electronService.storageGet(key)
    return result
  }

  async getItem(key: string): Promise<any> {
    const result = await this.getItemByExactKey(key)
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
          await this.electronService.storageSave(key, JSON.stringify(dbValue))
          return value
        })
      return result
    }
    return Promise.resolve(null)
  }
}
