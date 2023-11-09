import { Injectable } from '@angular/core'
import { StorageKey } from 'src/app/enums'
import { fromStrToB64, fromB64ToStr, randomBytes } from '../utils/crypto.util'
import { ElectronService } from './electron.service'
import type { UserState } from '../models'

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private userState: UserState
  private userPassword: string
  private isInitUserState: boolean = false
  constructor(private electronService: ElectronService) {}

  async getUserState(): Promise<UserState> {
    const str: string = await this.electronService.storageGet(StorageKey.userState)
    let userState: UserState = null
    try {
      userState = JSON.parse(fromB64ToStr(str))
    } catch (_) {
      userState = this.initUserState()
    }
    if (!userState || !userState.password || !userState.salt) {
      userState = this.initUserState()
    }
    if (this.isInitUserState) {
      await this.setUserState(userState)
      this.isInitUserState = false
    }
    return this.userState
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

  setPasswordEncryptionStrength(passwordEncryptionStrength: number) {
    if (passwordEncryptionStrength < 5000) {
      passwordEncryptionStrength = 5000
    }
    this.userState = {
      ...this.userState,
      passwordEncryptionStrength,
    }
    this.setUserState(this.userState)
    // TODO re-encrypt all data
  }

  private async setUserState(userState: UserState): Promise<void> {
    const str = JSON.stringify(userState)
    const base64 = fromStrToB64(str)
    await this.electronService.storageSave(StorageKey.userState, base64)
    this.userState = userState
  }

  private initUserState(): UserState {
    this.isInitUserState = true
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
