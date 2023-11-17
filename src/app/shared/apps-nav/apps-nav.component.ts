import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { LyDialog } from '@alyle/ui/dialog'
import { CommandListener } from 'src/app/decorator'
import { CommandEnum } from 'src/app/enums'
import { AppsNavDialogComponent } from './components/apps-nav-dialog.component'

@Component({
  selector: 'apps-nav',
  templateUrl: './apps-nav.component.html',
  styleUrls: ['./apps-nav.component.scss'],
})
export class AppsNavComponent implements OnInit, OnDestroy {
  @Input() paddingSize = 9
  constructor(private _dialog: LyDialog) {}

  ngOnInit() {}

  @CommandListener(CommandEnum.OpenAppsNavDialog)
  openAppsDialog() {
    this._dialog.open<AppsNavDialogComponent>(AppsNavDialogComponent, {})
  }

  ngOnDestroy() {}
}
