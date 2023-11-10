import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
} from '@angular/core'
import { LyDialogRef } from '@alyle/ui/dialog'
import { ReEncryptOnParameterChangeService } from 'src/app/services'
import type { NgModel } from '@angular/forms'

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
    private reEncryptOnParameterChangeService: ReEncryptOnParameterChangeService,
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
    try {
      await this.reEncryptOnParameterChangeService.changeUserPassword(this._password)
    } catch (err) {
      this.dialogRef.close({
        hasError: true,
        message: err.message,
      })
    }
    this.dialogRef.close({
      hasError: false,
      message: 'Password set successfully',
    })
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.ok()
    }
  }
}
