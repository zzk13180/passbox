/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
card add form dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, Inject, ChangeDetectionStrategy } from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { NotificationService } from '../../../services'
import type { Card } from '../../../models'

@Component({
  templateUrl: './card-add-dialog.html',
  styleUrls: ['./card-add-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardAddDialog {
  _if: boolean
  see = true

  constructor(
    public dialogRef: LyDialogRef,
    @Inject(LY_DIALOG_DATA) public data: Card,
    private notificationService: NotificationService,
  ) {
    this._if = false
  }

  showPasswordGeneratorDialog() {
    this.notificationService.sendNotification('showPasswordGeneratorDialog')
  }
}
