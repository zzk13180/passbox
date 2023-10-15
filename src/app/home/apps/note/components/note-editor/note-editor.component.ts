import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import ImageResize from 'quill-image-resize-module'
import Quill from 'quill'
import { fromEvent } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { NoteStoreService } from '../../store/note-store.service'
import { Note } from '../../models'

@Component({
  selector: 'note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('quillEditor') quillEditor: ElementRef
  @ViewChild('quillEditorToolbar') quillEditorToolbar: ElementRef
  @ViewChild('quillEditorContainer') quillEditorContainer: ElementRef
  @Input() note: Note
  private quill: Quill

  constructor(
    private noteStoreService: NoteStoreService,
    private _dialog: MatDialog,
  ) {}

  async ngAfterViewInit() {
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
      .pipe(debounceTime(300))
      .subscribe(() => {
        const txt = this.quill.getText()
        this.note.content = txt
        this.noteStoreService.updatedContent(this.note)
      })
    this.quill.disable()
    const content = await this.noteStoreService.getNoteContentById(this.note.id)
    this.quill.setText(content)
    this.quill.enable()
  }

  onTitleChanged(): void {
    this.noteStoreService.updatedTitle()
  }

  deleteNote(note: Note): void {
    const { dialog } = window.electronAPI
    dialog.showMessageBox(
      {
        type: 'question',
        message: 'Delete Note',
        detail: 'Are you sure to delete this note?',
        buttons: ['Cancel', 'Yes'],
        defaultId: 1,
        cancelId: 0,
        noLink: true,
      },
      result => {
        result.response === 1 && this.noteStoreService.deleteNoteById(note.id)
      },
    )
  }

  ngOnDestroy() {
    this.quill = null
  }
}
