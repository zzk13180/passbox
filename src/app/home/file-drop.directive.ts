import { Directive, EventEmitter, HostListener, Output } from '@angular/core'

@Directive({
  selector: '[homeFileDrop]',
})
export class FileDropDirective {
  @Output() fileDrop = new EventEmitter<{ name: string; path: string }>()

  constructor() {}

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    const file = event.dataTransfer?.files[0]
    if (!file) {
      return
    }
    const { name, path } = file
    if (name && path) {
      this.fileDrop.emit({ name, path })
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(event: Event): void {
    event.preventDefault()
  }
}
