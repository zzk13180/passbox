/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
select export type dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, ChangeDetectionStrategy } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { LyDialogRef } from '@alyle/ui/dialog'

@Component({
  templateUrl: './export-select-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportSelectDialog {
  myForm = new UntypedFormGroup({
    option: new UntypedFormControl('encrypted', Validators.required),
  })

  constructor(public dialogRef: LyDialogRef) {}

  onSubmit() {
    this.dialogRef.close(this.myForm.value)
  }
}
