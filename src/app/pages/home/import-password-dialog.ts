import { Component, ChangeDetectionStrategy } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { LyDialogRef } from '@alyle/ui/dialog'

@Component({
  templateUrl: './import-password-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportPasswordDialog {
  myForm = new UntypedFormGroup({
    password: new UntypedFormControl('', [Validators.required]),
  })

  get password() {
    return this.myForm.get('password')!
  }

  constructor(public dialogRef: LyDialogRef) {}

  onSubmit() {
    this.dialogRef.close(this.myForm.value)
  }
}
