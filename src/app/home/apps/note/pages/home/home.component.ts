import { Component, OnInit } from '@angular/core'
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
export class HomeComponent implements OnInit {
  notes: Note[]
  activeNoteIndex = 0
  constructor(
    private _dialog: MatDialog,
    private _noteStore: NoteStoreService,
    private activatedroute: ActivatedRoute,
  ) {
    this.notes = this._noteStore.notes
  }

  ngOnInit(): void {
    this.activatedroute.queryParamMap.subscribe((paramMap: ParamMap) => {
      const activeNoteId = paramMap.get('id')
      if (activeNoteId) {
        this.activateNoteById(activeNoteId)
      } else if (this.notes.length > 0) {
        this.setActiveNote(0)
      }
    })
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.setActiveNote(event.index)
  }

  updateNote(note: Note): void {
    this._noteStore.updateNote(note)
  }

  deleteNote(note: Note): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      data: {
        messageHeader: 'delete this note?',
      },
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._noteStore.deleteNoteById(note.id)
      }
    })
  }

  activateNoteById(id: string): void {
    this.notes.forEach((note, index) => {
      if (note.id === id) {
        this.setActiveNote(index)
      }
    })
  }

  setActiveNote(noteIndex: number) {
    this.activeNoteIndex = noteIndex
    this._noteStore.activeNote = this.notes[noteIndex]
  }
}
