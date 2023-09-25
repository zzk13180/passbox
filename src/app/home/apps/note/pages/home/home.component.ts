import { Component } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { ActivatedRoute, ParamMap } from '@angular/router'

import { NoteStoreService } from '../../store/note-store.service'
import { ConfirmDialogComponent } from '../../components/confirm-dialog'
import { Note } from '../../models'

@Component({
  selector: 'note-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  notes: Note[]
  activeNoteIndex = 0

  constructor(
    private _dialog: MatDialog,
    private noteStoreService: NoteStoreService,
    private activatedroute: ActivatedRoute,
  ) {
    this.notes = this.noteStoreService.notes
    this.activatedroute.queryParamMap.subscribe((paramMap: ParamMap) => {
      const activeNoteId = paramMap.get('id')
      if (activeNoteId) {
        const index = this.notes.findIndex(note => note.id === activeNoteId)
        this.setActiveNoteIndex(index)
      }
    })
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.setActiveNoteIndex(event.index)
  }

  updatedContent(note: Note): void {
    this.noteStoreService.updatedContent(note)
  }

  updatedTitle(_note: Note): void {
    this.noteStoreService.updatedTitle()
  }

  deleteNote(note: Note): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        messageHeader: 'delete this note?',
      },
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.noteStoreService.deleteNoteById(note.id)
      }
    })
  }

  private setActiveNoteIndex(noteIndex: number) {
    this.activeNoteIndex = noteIndex
    const activeNote = this.notes[this.activeNoteIndex]
    if (activeNote) {
      this.noteStoreService.getNoteContentById(activeNote.id).then(content => {
        activeNote.content = content
      })
    }
  }
}
