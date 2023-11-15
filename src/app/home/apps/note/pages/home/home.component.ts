import { Component, OnInit, OnDestroy } from '@angular/core'
import { MatTabChangeEvent } from '@angular/material/tabs'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { NoteStoreService } from '../../store/note-store.service'
import { Note } from '../../models'
import type { Unsubscribable } from 'rxjs'

@Component({
  selector: 'note-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  notes: Note[]
  activeNoteIndex = 0
  private readonly subscription: Unsubscribable
  constructor(
    private noteStoreService: NoteStoreService,
    private activatedroute: ActivatedRoute,
  ) {
    this.notes = this.noteStoreService.notes
    this.subscription = this.activatedroute.queryParamMap.subscribe(
      (paramMap: ParamMap) => {
        let index = this.activeNoteIndex
        const activeNoteId = paramMap.get('id')
        if (activeNoteId) {
          index = this.notes.findIndex(note => note.id === activeNoteId)
        } else if (this.notes.length === 0) {
          const id = this.noteStoreService.addNewNote()
          index = this.notes.findIndex(note => note.id === id)
        }
        this.activeNoteIndex = index
      },
    )
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.activeNoteIndex = event.index
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}
