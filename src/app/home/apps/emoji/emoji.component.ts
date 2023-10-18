import { Component } from '@angular/core'
import { LyDialog } from '@alyle/ui/dialog'
import { AppsDialog } from 'src/app/home/components/apps-dialog/apps-dialog'
import { emojis } from './emoji.data'

@Component({
  selector: 'apps-emoji',
  templateUrl: './emoji.component.html',
  styleUrls: ['./emoji.component.scss'],
})
export class EmojiComponent {
  emojis = emojis
  constructor(private _dialog: LyDialog) {}

  openAppsDialog() {
    this._dialog.open<AppsDialog>(AppsDialog, {})
  }
}
