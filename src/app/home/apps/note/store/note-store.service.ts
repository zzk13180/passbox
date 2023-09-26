import { Injectable } from '@angular/core'

import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'

import { Note } from '../models'
import { NoteRepository } from '../repositories'

@Injectable({
  providedIn: 'root',
})
export class NoteStoreService {
  private noteTabs: Note[]
  private updateNoteContent$ = new Subject<Note>()

  constructor(private repository: NoteRepository) {
    this.noteTabs = repository.getNoteTabs()
    this.updateNoteContent$.pipe(debounceTime(300)).subscribe(note => {
      this.repository.updateNoteContent(note)
    })
  }

  get notes(): Note[] {
    return this.noteTabs
  }

  addNewNote(): string {
    const id = crypto.randomUUID()
    const note = {
      id,
      title: '',
      content: '',
      createdAt: new Date(),
    }
    this.noteTabs.push(note)
    this.repository.addNewNote(note)
    this.repository.setNoteTabs(this.noteTabs)
    return id
  }

  async getNoteContentById(id: string): Promise<string> {
    const content = await this.repository.getNoteContentById(id)
    return content
  }

  deleteNoteById(id: string): void {
    const index = this.noteTabs.findIndex(note => note.id === id)
    if (index !== -1) {
      this.noteTabs.splice(index, 1)
      this.repository.deleteNoteById(id)
    }
  }

  updatedContent(note: Note): void {
    this.updateNoteContent$.next(note)
  }

  updatedTitle(): void {
    this.repository.setNoteTabs(this.noteTabs)
  }
}