import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
} from '@angular/core'
import { LyDialogRef } from '@alyle/ui/dialog'
import { StorageKey } from 'src/app/enums'
import { UserStateService, CardsDbService } from 'src/app/services'
import type { NgModel } from '@angular/forms'
import type { CardState } from 'src/app/models'

@Component({
  templateUrl: './password-set-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordSetDialog implements AfterViewInit {
  see = true
  _password = ''
  @ViewChild('passwordModel') passwordModel: NgModel

  constructor(
    public dialogRef: LyDialogRef,
    private userStateService: UserStateService,
    private cardsDbService: CardsDbService,
  ) {}

  ngAfterViewInit(): void {
    const encoder = new TextEncoder()
    this.passwordModel.valueChanges.subscribe((password: string) => {
      const { byteLength } = encoder.encode(password)
      if (byteLength > 64) {
        this.passwordModel.control.setErrors({ maxbyte: true })
      }
    })
  }

  ok() {
    if (!this.passwordModel.valid) {
      return
    }
    this.changePassword()
  }

  private async changePassword() {
    let theCards: CardState
    try {
      theCards = await this.cardsDbService.getItem(StorageKey.cards)
      await this.userStateService.setUserPassword(this._password)
      this.cardsDbService.setItem(StorageKey.cards, theCards)
    } catch (err) {
      this.dialogRef.close(err)
    }
    this.dialogRef.close()
  }
}
