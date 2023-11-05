/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
Importing encrypted data requires a password 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { LyDialogRef } from '@alyle/ui/dialog'

@Component({
  templateUrl: './import-password-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPasswordDialog {
  passwordForm = new UntypedFormGroup({
    password: new UntypedFormControl('', [Validators.required]),
  })

  get password() {
    return this.passwordForm.get('password')!
  }

  constructor(public dialogRef: LyDialogRef) {}

  onSubmit() {
    this.dialogRef.close(this.passwordForm.value)
  }
}
