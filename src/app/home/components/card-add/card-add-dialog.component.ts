/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
card add form dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, Inject, ChangeDetectionStrategy, HostListener } from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { CommandService } from 'src/app/services'
import { CommandEnum } from 'src/app/enums'
import type { Card } from 'src/app/models'

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
    CommandService.triggerCommand(CommandEnum.OpenPasswordGeneratorDialog)
  }

  @HostListener('keypress', ['$event'])
  onkeyPress(event: KeyboardEvent) {
    if (['Enter'].includes(event.key)) {
      this.dialogRef.close(this.data)
    }
  }
}
