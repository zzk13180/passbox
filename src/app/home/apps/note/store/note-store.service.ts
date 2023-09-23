import { Injectable } from '@angular/core'
import { Note } from '../models'
import { NoteRepository } from '../repositories'

@Injectable({
  providedIn: 'root',
})
export class NoteStoreService {
  private _notes: Note[]
  private _activeNote: Note

  constructor(private _noteRepository: NoteRepository) {
    this._notes = _noteRepository.notes || []
  }

  get notes(): Note[] {
    return this._notes
  }

  get activeNote(): Note {
    return this._activeNote
  }

  set activeNote(note: Note) {
    this._activeNote = note
  }

  addNewNote(): string {
    const id = crypto.randomUUID()
    const note = {
      id,
      title: '',
      color: '#fff',
      content: '',
      createdAt: new Date(),
    }
    this._notes.push(note)
    this._noteRepository.notes = this._notes
    return id
  }

  deleteNoteById(id: string): void {
    const index = this._notes.findIndex(note => note.id === id)
    if (index !== -1) {
      this._notes.splice(index, 1)
      this._noteRepository.deleteNoteById(id)
    }
  }

  updateNote(noteToUpdate: Note): void {
    const index = this._notes.findIndex(note => note.id === noteToUpdate.id)
    if (index !== -1) {
      this._notes[index] = noteToUpdate
      this._noteRepository.notes = this._notes
    }
  }
}
