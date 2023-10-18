import {
  Component,
  Input,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  OnDestroy,
  NgZone,
} from '@angular/core'
import ImageResize from 'quill-image-resize-module'
import Quill from 'quill'
import { fromEvent, Subscription } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { NoteStoreService } from '../../store/note-store.service'
import { Note } from '../../models'
import type { DeltaStatic } from 'quill'

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
  private subscription: Subscription

  constructor(
    private noteStoreService: NoteStoreService,
    private ngZone: NgZone,
  ) {}

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.initQuill())
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

  private async initQuill(): Promise<void> {
    const Font = Quill.import('formats/font')
    Font.whitelist = [
      "'Noto Sans Arabic', 'Noto Sans', 'Noto Sans JP', 'Noto Sans SC', sans-serif",
    ]
    Quill.register('modules/imageResize', ImageResize)
    const parchment = Quill.import('parchment')
    const block = parchment.query('block')
    block.tagName = 'DIV'
    Quill.register(block, true)
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
      placeholder: 'Write something...',
    })
    // register text-change event
    this.subscription = fromEvent(this.quill, 'text-change')
      .pipe(debounceTime(300))
      .subscribe(() => {
        let content: string
        try {
          const value = this.quill.getContents()
          content = JSON.stringify(value)
        } catch (_) {
          content = this.quill.getText()
        }
        this.noteStoreService.updatedContent({ ...this.note, content })
      })
    // init content
    this.quill.disable()
    try {
      const value = await this.noteStoreService.getNoteContentById(this.note.id)
      if (value) {
        const content: DeltaStatic = JSON.parse(value)
        this.quill.setContents(content, 'silent')
        this.quill.getModule('history').clear()
      }
    } catch (_) {
      console.error(_)
    } finally {
      this.quill.enable()
    }
  }

  ngOnDestroy() {
    this.subscription && this.subscription.unsubscribe()
    this.quill = null
  }
}
