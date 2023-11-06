import { Injectable, Inject } from '@angular/core'
import { DOCUMENT } from '@angular/common'

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  private platform: string = window.electronAPI.process.platform

  private symbolsMap: Map<string, string> = new Map([
    ['backspace', '\u232B'], // ⌫
    ['tab', '\u21E5'], // ⇥
    ['enter', '\u23CE'], // ⏎
    ['capslock', '\u21EA'], // ⇪
    ['left', '\u2190'], // ←
    ['up', '\u2191'], // ↑
    ['right', '\u2192'], // →
    ['down', '\u2193'], // ↓
    ['del', '\u2326'], // ⌦
    ['meta', '\u2318'], // ⌘
    ['shift', '\u21E7'], // ⇧
    ['option', '\u2325'], // ⌥
  ])

  equals() {}

  allowIn(): boolean {
    return true
  }
}
