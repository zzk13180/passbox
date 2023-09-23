import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { NoteStoreService } from '../../store/note-store.service'
import { Note } from '../../models'

@Component({
  selector: 'note-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  notes: Note[] = []

  constructor(
    private _noteStore: NoteStoreService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.notes = this._noteStore.notes
  }

  onNoteClick(note: Note): void {
    const { id } = note
    const urlTree = this.router.createUrlTree(['/apps/note/home'], {
      queryParams: { id },
    })
    const url: string = urlTree.toString()
    this.router.navigateByUrl(url)
  }
}
