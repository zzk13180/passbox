import { Component, Input, Output, EventEmitter } from '@angular/core'

import Quill from 'quill'
import ImageResize from 'quill-image-resize-module'
import { Note } from '../../models'

const parchment = Quill.import('parchment')
const block = parchment.query('block')
block.tagName = 'DIV'
Quill.register(block, true)
Quill.register('modules/imageResize', ImageResize)

@Component({
  selector: 'note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
})
export class NoteEditorComponent {
  editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['image', 'code-block', 'formula'],
      [{ header: [1, 2, false] }],
    ],
    imageResize: {
      displaySize: true,
    },
  }

  @Input() note: Note
  @Output() updatedTitle: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() updatedContent: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() delete: EventEmitter<Note> = new EventEmitter<Note>()

  onTitleChanged(): void {
    this.updatedTitle.emit(this.note)
  }

  deleteNote(note: Note): void {
    this.delete.emit(note)
  }

  onContentChanged() {
    this.updatedContent.emit(this.note)
  }
}
