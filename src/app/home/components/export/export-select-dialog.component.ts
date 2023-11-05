/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
select export type dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms'
import { LyDialogRef } from '@alyle/ui/dialog'
import { UserStateService } from 'src/app/services'

@Component({
  templateUrl: './export-select-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportSelectDialog implements OnInit {
  hide = true
  exportForm: UntypedFormGroup

  constructor(
    public dialogRef: LyDialogRef,
    private userStateService: UserStateService,
  ) {}

  ngOnInit() {
    const userPassword = this.userStateService.getUserPassword() || ''
    this.exportForm = new UntypedFormGroup({
      option: new UntypedFormControl('encrypted', Validators.required),
      password: new UntypedFormControl(userPassword, [
        Validators.required,
        Validators.minLength(3),
      ]),
    })
  }

  submit() {
    this.dialogRef.close(this.exportForm.value)
  }
}
