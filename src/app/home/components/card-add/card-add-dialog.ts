/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
card add form dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, Inject, ChangeDetectionStrategy } from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import type { Card } from '../../../models'

@Component({
  templateUrl: './card-add-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardAddDialog {
  _if: boolean

  constructor(public dialogRef: LyDialogRef, @Inject(LY_DIALOG_DATA) public data: Card) {
    this._if = false
  }
}
