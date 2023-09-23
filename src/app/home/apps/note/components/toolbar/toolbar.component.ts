import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { LyDialog } from '@alyle/ui/dialog'
import { AppsDialog } from 'src/app/home/components/apps-dialog/apps-dialog'
import { NoteStoreService } from '../../store/note-store.service'

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  constructor(
    private _noteStore: NoteStoreService,
    private _dialog: LyDialog,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  addNewNote(): void {
    const id = this._noteStore.addNewNote()
    const queryParams = { id }
    const urlTree = this.router.createUrlTree(['/apps/note/home'], {
      queryParams,
    })
    const url: string = urlTree.toString()
    this.router.navigateByUrl(url)
  }

  openAppsDialog() {
    const dialogRef = this._dialog.open<AppsDialog>(AppsDialog, {})
    dialogRef.afterClosed.subscribe()
  }
}
