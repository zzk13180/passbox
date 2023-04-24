import { Injectable } from '@angular/core'
import { StorageKey } from '../enums/storageKey'
import { CryptoService } from './crypto.service'
import { ElectronService } from './electron.service'
import type { CardState } from '../models'

@Injectable({
  providedIn: 'root',
})
export class DbService {
  constructor(
    private cryptoService: CryptoService,
    private electronService: ElectronService,
  ) {}

  async getItem(key: StorageKey): Promise<CardState> {
    const data = await this.electronService.storageGet(key)
    let result = null
    try {
      const value = JSON.parse(data)
      const str = await this.cryptoService.decryptToUtf8(value)
      result = JSON.parse(str)
    } catch (_) {
      throw new Error('Error while getting data from db')
    }
    return result
  }

  async setItem(key: StorageKey, value: CardState): Promise<boolean> {
    if (!key || !value) {
      throw new Error('Key or value is not defined')
    }
    try {
      const encryptValue = await this.cryptoService.encrypt(JSON.stringify(value))
      await this.electronService.storageSave(key, JSON.stringify(encryptValue))
    } catch (_) {
      throw new Error('Error while setting data to db')
    }
    return Promise.resolve(true)
  }
}
