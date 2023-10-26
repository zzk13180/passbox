import { Injectable } from '@angular/core'
import { StorageKey, DBError } from 'src/app/enums'
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

  async getItem(key: StorageKey.cards): Promise<CardState> {
    const data = await this.electronService.storageGet(key)
    if (!data) {
      throw new Error(DBError.noData)
    }
    let result = null
    try {
      const value = JSON.parse(data)
      const str = await this.cryptoService.decryptToUtf8(value)
      result = JSON.parse(str)
    } catch (_) {
      throw new Error(DBError.errorWhileGettingData)
    }
    return result
  }

  async setItem(key: StorageKey.cards, value: CardState): Promise<boolean> {
    if (!key || !value) {
      throw new Error(DBError.keyOrValueIsNotDefined)
    }
    try {
      const encryptValue = await this.cryptoService.encrypt(JSON.stringify(value))
      await this.electronService.storageSave(key, JSON.stringify(encryptValue))
    } catch (_) {
      throw new Error(DBError.errorWhileSettingData)
    }
    return Promise.resolve(true)
  }
}
