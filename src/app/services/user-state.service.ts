import { Injectable } from '@angular/core'
import { fromStrToB64, fromB64ToStr, randomBytes } from '../utils/crypto.util'
import { StorageKey } from '../enums'
import { ElectronService } from './electron.service'
import type { UserState } from '../models'

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userPassword: string // user password don't save in storage
  private userState: UserState
  constructor(private electronService: ElectronService) {}

  async getUserState(): Promise<UserState> {
    if (
      this.userState &&
      this.userState.password &&
      this.userState.salt &&
      this.userState.passwordEncryptionStrength
    ) {
      return this.userState
    }
    let userState: UserState = null
    try {
      const str: string = await this.electronService.cardsStorageGet(StorageKey.userState)
      userState = JSON.parse(fromB64ToStr(str))
    } catch (_) {
      userState = this.initUserState()
    }
    if (!userState || !userState.password || !userState.salt) {
      userState = this.initUserState()
    }
    await this.setUserState(userState) // save user state in storage and this class
    return this.userState
  }

  getUserPassword(): string {
    return this.userPassword
  }

  setUserPassword(password: string) {
    this.userPassword = password
  }

  async setPasswordEncryptionStrength(passwordEncryptionStrength: number): Promise<void> {
    await this.setUserState({
      ...this.userState,
      passwordEncryptionStrength,
    })
  }

  async setUserState(userState: UserState): Promise<void> {
    const str = JSON.stringify(userState)
    const value = fromStrToB64(str)
    await this.electronService.cardsStorageSave(StorageKey.userState, value)
    this.userState = userState
  }

  private initUserState(): UserState {
    const { password, salt } = this.generatePassworAndSalt()
    return {
      passwordEncryptionStrength: 5000,
      isRequiredLogin: false,
      password,
      salt,
    }
  }

  private generatePassworAndSalt(): {
    password: string
    salt: string
  } {
    let password = ''
    let salt = ''
    const bytes = randomBytes(87)
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
