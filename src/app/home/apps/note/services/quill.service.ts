import { Injectable, Injector } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import hljs from 'highlight.js'
import ImageResize from 'quill-image-resize-module'
import type Quill from 'quill'

@Injectable({
  providedIn: 'root',
})
export class QuillService {
  private Quill: typeof Quill
  private document: Document = this.injector.get(DOCUMENT)

  constructor(private injector: Injector) {
    this.injector.get(DOCUMENT)
  }

  async getQuill() {
    if (this.Quill) {
      return this.Quill
    }
    this.document.defaultView['hljs'] = hljs // syntax highlight

    const eventListener = this.document.addEventListener // zone.js monkey patching
    this.document.addEventListener = this.document['__zone_symbol__addEventListener'] // orginal event listener out of zone.js
    const quillImport = await import('quill')
    this.document.addEventListener = eventListener
    this.Quill = quillImport.default

    const Font = this.Quill.import('formats/font')
    Font.whitelist = [
      "'Noto Sans Arabic', 'Noto Sans', 'Noto Sans JP', 'Noto Sans SC', sans-serif",
    ]

    const parchment = this.Quill.import('parchment')
    const block = parchment.query('block')
    block.tagName = 'DIV'
    this.Quill.register(block, true)

    this.Quill.register('modules/imageResize', ImageResize)

    return this.Quill
  }
}
