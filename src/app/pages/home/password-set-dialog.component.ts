import { Component, ChangeDetectionStrategy, Inject } from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'

@Component({
  templateUrl: './password-set-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordSet {
  isLogin = false
  constructor(
    public dialogRef: LyDialogRef,
    @Inject(LY_DIALOG_DATA)
    public data: {
      password: string
    },
  ) {}

  ok() {
    console.log('ok')
    this.dialogRef.close(this.data.password)
  }
}
