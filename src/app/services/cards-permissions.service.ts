import { Injectable } from '@angular/core'
import { CardsDbService } from './db.service'
import { UserStateService } from './user-state.service'
import type { CardState } from '../models'

@Injectable({
  providedIn: 'root',
})
export class CardsPermissionsService {
  constructor(
    private db: CardsDbService,
    private userStateService: UserStateService,
  ) {}

  // just use for login
  async verifyUserPassword(userPassword: string): Promise<void> {
    if (!userPassword) {
      throw new Error('Password cannot be empty')
    }
    try {
      this.userStateService.setUserPassword(userPassword)
      await this.db.getCards()
    } catch (error) {
      throw new Error('Wrong password')
    }
  }

  async changeUserPassword(userPassword: string): Promise<void> {
    if (!userPassword) {
      throw new Error('Password cannot be empty')
    }
    await this.verifyCardsPermissionsAndExecuteOperation(async () => {
      this.userStateService.setUserPassword(userPassword)
      const userState = await this.userStateService.getUserState()
      if (!userState.isRequiredLogin) {
        await this.userStateService.setUserState({
          ...userState,
          isRequiredLogin: true,
        })
      }
    })
  }

  async changePasswordEncryptionStrength(passwordEncryptionStrength: number) {
    if (passwordEncryptionStrength < 5000) {
      passwordEncryptionStrength = 5000
    }
    await this.verifyCardsPermissionsAndExecuteOperation(async () => {
      await this.userStateService.setPasswordEncryptionStrength(
        passwordEncryptionStrength,
      )
    })
  }

  async clearCardsAndSetLoginNoRequired(): Promise<void> {
    const theCards: CardState = { term: '', items: [], deletedItems: [] }
    const userState = await this.userStateService.getUserState()
    await this.userStateService.setUserState({
      ...userState,
      isRequiredLogin: false,
    })
    await this.db.setCards(theCards, true)
  }

  private async verifyCardsPermissionsAndExecuteOperation(
    operation: () => Promise<void>,
  ) {
    let theCards: CardState
    try {
      theCards = await this.db.getCards()
    } catch (error) {
      throw new Error(`Permissions error: ${error.message}`)
    }
    await operation()
    try {
      await this.db.setCards(theCards)
    } catch (error) {
      throw new Error(`Operation error: ${error.message}`)
    }
  }
}
