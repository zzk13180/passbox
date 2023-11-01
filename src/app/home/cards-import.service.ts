import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { StorageKey } from 'src/app/enums'
import { ElectronService, CryptoService, UserState } from '../services'
import { fromB64ToStr } from '../utils/crypto.util'
import { html2cards } from './home.util'
import type { Card, CipherString } from '../models'

type DATA = {
  cards: CipherString
  userState: UserState
  userPassword?: string
}

@Injectable()
export class CardsImportService {
  private userPasswordInput$ = new Subject<any>()
  constructor(
    private electronService: ElectronService,
    private cryptoService: CryptoService,
  ) {}

  get inputUserPassword$() {
    return this.userPasswordInput$.asObservable()
  }

  async decryptData2cards(data: DATA): Promise<Card[]> {
    const { cards, userState, userPassword } = data
    let result = null
    try {
      const str = await this.cryptoService.decryptToUtf8WithExternalUserState(
        cards,
        userState,
        userPassword,
      )
      result = JSON.parse(str)
    } catch (_) {
      throw new Error('invalid data')
    }
    return result.items
  }

  importData(): Promise<Card[]> {
    const { dialog } = window.electronAPI
    return new Promise((resolve, reject) => {
      dialog.showOpenDialog(
        {
          title: 'import data',
          filters: [
            {
              name: 'passbox',
              extensions: ['json', 'html'],
            },
          ],
          properties: ['openFile'],
        },
        async result => {
          const filePath = result.filePaths?.[0]
          if (!filePath) {
            return
          }
          const ext = filePath.split('.').pop()
          const data = await this.electronService.readFile(filePath)
          try {
            let cards: Card[] = []
            if (ext === 'json') {
              cards = await this.handleJsonData(data)
            } else {
              cards = this.handleHtmlData(data)
            }
            resolve(cards)
          } catch (error) {
            reject(error)
          }
        },
      )
    })
  }

  private handleHtmlData(data: string): Card[] {
    const cards = html2cards(data)
    if (!cards.length || typeof cards[0] !== 'object') {
      throw new Error('invalid data')
    }
    return cards
  }

  private async handleJsonData(data: string): Promise<Card[]> {
    let jsonData = null
    try {
      jsonData = JSON.parse(data)
    } catch (_) {
      throw new Error('invalid data')
    }
    if (Array.isArray(jsonData)) {
      return jsonData
    } else if (Array.isArray(jsonData?.items)) {
      return jsonData.items
    } else if (jsonData?.cards && jsonData?.userState) {
      let result: Card[]
      try {
        result = await this.parseEncryptedData(jsonData)
      } catch (error) {
        throw new Error(error?.message)
      }
      return result
    } else {
      throw new Error('invalid data')
    }
  }

  private parseEncryptedData(data: {
    [StorageKey.cards]: string
    [StorageKey.userState]: string
  }): Promise<Card[]> {
    let cards: CipherString = null
    let userState: UserState = null
    try {
      cards = JSON.parse(data.cards)
      userState = JSON.parse(fromB64ToStr(data.userState))
    } catch (_) {
      throw new Error('invalid data')
    }
    const { isRequiredLogin } = userState as UserState
    if (isRequiredLogin) {
      this.userPasswordInput$.next({ cards, userState })
      throw new Error('please input password')
    } else {
      return this.decryptData2cards({ cards, userState })
    }
  }
}
