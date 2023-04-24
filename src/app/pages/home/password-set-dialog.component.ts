import {
  Component,
  Inject,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
} from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { DbService } from '../../services'
import { StorageKey } from '../../enums/storageKey'
import type { NgModel } from '@angular/forms'

@Component({
  templateUrl: './password-set-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordSet implements AfterViewInit {
  see = false
  _password = ''
  @ViewChild('passwordModel') passwordModel: NgModel
  constructor(
    public dialogRef: LyDialogRef,
    private dbService: DbService,
    @Inject(LY_DIALOG_DATA)
    public data: {
      login: boolean
    },
  ) {}

  ngAfterViewInit(): void {
    const encoder = new TextEncoder()
    this.passwordModel.valueChanges.subscribe((password: string) => {
      const { byteLength } = encoder.encode(password)
      if (byteLength > 14) {
        this.passwordModel.control.setErrors({ maxbyte: true })
      }
    })
  }

  async ok() {
    if (!this.passwordModel.valid) {
      return
    }
    let canModifyPassword = false
    try {
      // ok means permission can read encrypted data
      await this.dbService.getItem(StorageKey.loginRequired)
      canModifyPassword = true
    } catch (_) {}
    if (canModifyPassword && this.passwordModel.valid) {
      try {
        await this.dbService.changePassword(this._password)
      } catch (error) {
        this.passwordModel.control.setErrors({ changePasswordFail: true })
        return
      }
      this.dialogRef.close()
    }
  }
}
