import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import ImageResize from 'quill-image-resize-module'
import Quill from 'quill'
import { fromEvent } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { Note } from '../../models'

@Component({
  selector: 'note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteEditorComponent implements AfterViewInit, OnChanges {
  @ViewChild('quillEditor') quillEditor: ElementRef
  @ViewChild('quillEditorToolbar') quillEditorToolbar: ElementRef
  @ViewChild('quillEditorContainer') quillEditorContainer: ElementRef
  @Input() note: Note
  @Input() content: string
  @Output() updatedTitle: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() updatedContent: EventEmitter<Note> = new EventEmitter<Note>()
  @Output() delete: EventEmitter<Note> = new EventEmitter<Note>()
  private quill: Quill

  ngAfterViewInit() {
    const Font = Quill.import('formats/font')
    Font.whitelist = [
      "'Noto Sans Arabic', 'Noto Sans', 'Noto Sans JP', 'Noto Sans SC', sans-serif",
    ]
    Quill.register('modules/imageResize', ImageResize)
    this.quill = new Quill(this.quillEditor.nativeElement, {
      bounds: this.quillEditorContainer.nativeElement,
      modules: {
        toolbar: this.quillEditorToolbar.nativeElement,
        syntax: true,
        imageResize: {
          displaySize: true,
        },
      },
      theme: 'snow',
    })
    fromEvent(this.quill, 'text-change')
      .pipe(debounceTime(500))
      .subscribe(() => {
        const txt = this.quill.getText()
        if (txt !== this.note.content) {
          this.note.content = txt
          this.updatedContent.emit(this.note)
        }
      })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['content'] && changes['content'].currentValue) {
      this.quill.setText(changes['content'].currentValue)
    }
  }

  onTitleChanged(): void {
    this.updatedTitle.emit(this.note)
  }

  deleteNote(note: Note): void {
    this.delete.emit(note)
  }
}
