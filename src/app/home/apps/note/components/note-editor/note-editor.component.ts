import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Note } from '../../models'

@Component({
  selector: 'note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent {
  @Input() note: Note
  @Output() updated: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() delete: EventEmitter<Note> = new EventEmitter<Note>()

  change(): void {
    this.updated.emit(this.note)
  }

  deleteNote(note: Note): void {
    this.delete.emit(note)
  }

  created(event: any) {}

  changedEditor(event: any) {}

  focus($event) {}

  nativeFocus($event) {}

  blur($event) {}

  nativeBlur($event) {}
}
