import { Injectable } from '@angular/core'
import { StorageKey, DBError } from 'src/app/enums'
import { CryptoService } from './crypto.service'
import { ElectronService } from './electron.service'
import type { CardState } from '../models'

@Injectable({
  providedIn: 'root',
})
export class CardsDbService {
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
      throw new Error(DBError.decryptError)
    }
    const { items, deletedItems } = result || {}
    if (![items, deletedItems].every(Array.isArray)) {
      throw new Error(DBError.dataFormatError)
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

  async getVersions(): Promise<string> {
    const data = await this.electronService.storageGet(StorageKey.versions)
    return data
  }

  async getHistoryItem(version: string): Promise<string | null> {
    let data = null
    try {
      data = await this.electronService.storageGetHistoryItem(version)
    } catch (_) {
      return null
    }
    try {
      const value = JSON.parse(data)
      if (!value || !value.cards || !value.userState) {
        return null
      }
    } catch (_) {
      return null
    }
    return data
  }
}
