import { Injectable } from '@angular/core'
import { StorageKey } from '../enums/storageKey'
import { ElectronService } from './electron.service'
import { CryptoFunctionService } from './cryptoFunction.service'

export interface UseState {
  isRequiredLogin: boolean
  password: string
  salt: string
}

@Injectable({
  providedIn: 'root',
})
export class UseStateService {
  private useState: UseState
  private userPassword: string
  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private electronService: ElectronService,
  ) {
    this.useState = {
      isRequiredLogin: false,
      password: '',
      salt: '',
    }
  }

  async getUseState(): Promise<UseState> {
    const str: string = await this.electronService.storageGet(StorageKey.useState)
    try {
      this.useState = JSON.parse(str)
    } catch (_) {
      const { password, salt } = await this.generatePassworAndSalt()
      this.useState = {
        isRequiredLogin: false,
        password,
        salt,
      }
      await this.setUseState(this.useState)
    }
    return this.useState
  }

  async setUseState(useState: UseState): Promise<void> {
    await this.electronService.storageSave(StorageKey.useState, JSON.stringify(useState))
    this.useState = useState
  }

  getUserPassword(): string {
    return this.userPassword
  }

  async setUserPassword(userPassword: string): Promise<void> {
    await this.setUseState({ ...this.useState, isRequiredLogin: true })
    this.userPassword = userPassword
  }

  private async generatePassworAndSalt(): Promise<Omit<UseState, 'isRequiredLogin'>> {
    const bytes = await this.cryptoFunctionService.randomBytes(35)
    let password = ''
    let salt = ''
    const arr = new Uint8Array(bytes)
    for (let i = 0; i < arr.byteLength; i++) {
      if (i < 14) {
        password += `${arr[i]}${i === 13 ? '' : ','}`
      } else {
        salt += `${arr[i]}${i === 34 ? '' : ','}`
      }
    }
    return { password, salt }
  }
}
