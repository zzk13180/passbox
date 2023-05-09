import { Injectable } from '@angular/core'
import { StorageKey } from '../enums/storageKey'
import { ElectronService } from './electron.service'
import { CryptoFunctionService } from './cryptoFunction.service'

export interface UserState {
  isRequiredLogin: boolean
  password: string
  salt: string
}

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userState: UserState
  private userPassword: string
  constructor(
    private cryptoFunctionService: CryptoFunctionService,
    private electronService: ElectronService,
  ) {}

  async getUserState(): Promise<UserState> {
    const str: string = await this.electronService.storageGet(StorageKey.userState)
    let userState: UserState = null
    try {
      const data = JSON.parse(str)
      userState = { isRequiredLogin: data.a, password: data.b, salt: data.c }
    } catch (_) {
      userState = await this.initUserState()
    }
    if (!userState || !userState.password || !userState.salt) {
      userState = await this.initUserState()
    }
    await this.setUserState(userState)
    return this.userState
  }

  private async initUserState(): Promise<UserState> {
    const { password, salt } = await this.generatePassworAndSalt()
    return {
      isRequiredLogin: false,
      password,
      salt,
    }
  }

  private async setUserState(userState: UserState): Promise<void> {
    await this.electronService.storageSave(
      StorageKey.userState,
      JSON.stringify({
        a: userState.isRequiredLogin,
        b: userState.password,
        c: userState.salt,
      }),
    )
    this.userState = userState
  }

  getUserPassword(): string {
    return this.userPassword
  }

  async setUserPassword(userPassword: string): Promise<void> {
    await this.setUserState({
      ...this.userState,
      isRequiredLogin: true,
    })
    this.userPassword = userPassword
  }

  private async generatePassworAndSalt(): Promise<Omit<UserState, 'isRequiredLogin'>> {
    const bytes = await this.cryptoFunctionService.randomBytes(87)
    let password = ''
    let salt = ''
    const arr = new Uint8Array(bytes)
    for (let i = 0; i < arr.byteLength; i++) {
      if (i < 64) {
        password += `${arr[i]}${i === 63 ? '' : ','}`
      } else {
        salt += `${arr[i]}${i === 86 ? '' : ','}`
      }
    }
    return { password, salt }
  }
}
