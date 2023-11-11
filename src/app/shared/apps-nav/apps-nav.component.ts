import { Component, Input } from '@angular/core'
import { LyDialog } from '@alyle/ui/dialog'
import { AppsNavDialogComponent } from './components/apps-nav-dialog.component'

@Component({
  selector: 'apps-nav',
  templateUrl: './apps-nav.component.html',
  styleUrls: ['./apps-nav.component.scss'],
})
export class AppsNavComponent {
  @Input() paddingSize = 9
  constructor(private _dialog: LyDialog) {}

  openAppsDialog() {
    this._dialog.open<AppsNavDialogComponent>(AppsNavDialogComponent, {})
  }
}
