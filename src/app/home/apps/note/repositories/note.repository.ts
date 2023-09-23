import { Injectable } from '@angular/core'
import { Note } from '../models'

@Injectable({
  providedIn: 'root',
})
export class NoteRepository {
  readonly localStorageKey = 'passbox::apps::note'
  private _notes: Note[] = []

  constructor() {
    this._notes = JSON.parse(localStorage.getItem(this.localStorageKey))
  }

  get notes(): Note[] {
    this._notes = JSON.parse(localStorage.getItem(this.localStorageKey))
    return this._notes
  }

  set notes(notes: Note[]) {
    this._notes = JSON.parse(JSON.stringify(notes))
    localStorage.setItem(this.localStorageKey, JSON.stringify(notes))
  }

  eraseAll(): void {
    localStorage.clear()
  }

  getNoteById(id: string): Note | undefined {
    return this._notes.find(note => note.id === id)
  }

  getNoteByIndex(index: number): Note | undefined {
    return this._notes[index]
  }

  deleteNoteById(id: string): undefined {
    this._notes.forEach((note, index) => {
      if (note.id === id) {
        this._notes.splice(index, 1)
      }
    })
    this.notes = this._notes
  }

  deleteNoteByIndex(index: number) {
    if (!index) {
      return
    }
    this._notes.splice(index, 1)
    this.notes = this._notes
  }

  addNote(note: Note): void {
    this._notes.push(note)
    this.notes = this._notes
  }
}
