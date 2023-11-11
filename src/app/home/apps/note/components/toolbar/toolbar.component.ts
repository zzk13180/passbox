import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NoteStoreService } from '../../store/note-store.service'

@Component({
  selector: 'note-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  constructor(
    private _noteStore: NoteStoreService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // empty
  }

  addNewNote(): void {
    const id = this._noteStore.addNewNote()
    const queryParams = { id }
    const urlTree = this.router.createUrlTree(['/apps/note/home'], {
      queryParams,
    })
    const url: string = urlTree.toString()
    this.router.navigateByUrl(url)
  }
}
