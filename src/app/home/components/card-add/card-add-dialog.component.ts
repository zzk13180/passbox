/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
card add form dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, Inject, ChangeDetectionStrategy, HostListener } from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import type { Card } from '../../../models'

@Component({
  templateUrl: './card-add-dialog.component.html',
  styleUrls: ['./card-add-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardAddDialog {
  _if: boolean
  see = true

  constructor(
    public dialogRef: LyDialogRef,
    @Inject(LY_DIALOG_DATA) public data: Card,
  ) {
    this._if = false
  }

  showPasswordGeneratorDialog() {
    // TODO
    // this.notificationService.sendNotification('showPasswordGeneratorDialog')
  }

  private keyCodes: string[] = ['Enter'] // TODO
  @HostListener('keypress', ['$event'])
  onkeyPress(event: KeyboardEvent) {
    console.log('card-add-dialog.component.ts: onkeyPress: event: ', event)
    if (this.keyCodes.includes(event.code)) {
      this.dialogRef.close(this.data)
    }
  }
}
