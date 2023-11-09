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

  async getCards(): Promise<CardState> {
    const data = await this.electronService.cardsStorageGet(StorageKey.cards)
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

  async setCards(
    value: CardState,
    needRecordVersions: boolean = false,
  ): Promise<boolean> {
    if (!value) {
      throw new Error(DBError.EmptyValue)
    }
    try {
      const encryptValue = await this.cryptoService.encrypt(JSON.stringify(value))
      await this.electronService.cardsStorageSave(
        StorageKey.cards,
        JSON.stringify(encryptValue),
        needRecordVersions,
      )
    } catch (_) {
      throw new Error(DBError.errorWhileSettingData)
    }
    return Promise.resolve(true)
  }
}
