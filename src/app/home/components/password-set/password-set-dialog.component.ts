import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core'
import { LyDialogRef } from '@alyle/ui/dialog'
import { UserStateService, CardsPermissionsService } from 'src/app/services'
import type { NgModel } from '@angular/forms'
import type { Unsubscribable } from 'rxjs'

@Component({
  templateUrl: './password-set-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordSetDialog implements AfterViewInit, OnDestroy {
  see: boolean = false
  _password: string
  private subscription: Unsubscribable
  @ViewChild('passwordModel') passwordModel: NgModel

  constructor(
    public dialogRef: LyDialogRef,
    private userStateService: UserStateService,
    private cardsPermissionsService: CardsPermissionsService,
  ) {
    this._password = this.userStateService.getUserPassword() || ''
  }

  ngAfterViewInit(): void {
    const encoder = new TextEncoder()
    this.subscription = this.passwordModel.valueChanges.subscribe((password: string) => {
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
    try {
      await this.cardsPermissionsService.changeUserPassword(this._password)
    } catch (err) {
      this.dialogRef.close({
        hasError: true,
        message: err.message,
      })
    }
    this.dialogRef.close({
      hasError: false,
      message: 'Password set success',
    })
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.ok()
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}
