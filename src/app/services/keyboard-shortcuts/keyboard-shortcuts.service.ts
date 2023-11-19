/* eslint-disable complexity */
import { Injectable, Inject } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import {
  KeyCode,
  KeyCodeUtils,
  ScanCode,
  ScanCodeUtils,
  IMMUTABLE_KEY_CODE_TO_CODE,
  IMMUTABLE_CODE_TO_KEY_CODE,
} from './keyboard-codes'
import { IKeyboardEvent, StandardKeyboardEvent } from './keyboard-event'
import { ScanCodeChord, KeyCodeChord, Chord } from './keyboard-bindings'
import { KeybindingParser } from './keyboard-parser'

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsService {
  private readonly isWindows: boolean
  private readonly scanCodeToDispatch: Array<string | null> = []

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.isWindows = window.electronAPI.process.platform === 'win32'

    for (let scanCode = ScanCode.None; scanCode < ScanCode.MAX_VALUE; scanCode++) {
      this.scanCodeToDispatch[scanCode] = null
    }

    for (let scanCode = ScanCode.None; scanCode < ScanCode.MAX_VALUE; scanCode++) {
      const keyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode]
      if (keyCode !== KeyCode.DependsOnKbLayout) {
        if (
          keyCode === KeyCode.Unknown ||
          keyCode === KeyCode.Ctrl ||
          keyCode === KeyCode.Meta ||
          keyCode === KeyCode.Alt ||
          keyCode === KeyCode.Shift
        ) {
          this.scanCodeToDispatch[scanCode] = null // cannot dispatch on this ScanCode
        } else {
          this.scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`
        }
      }
    }

    try {
      // @ts-ignore
      this.document.defaultView.navigator.keyboard.getLayoutMap().then((e: any) => {
        const rawMappings = {}
        for (const key of e) {
          rawMappings[key[0]] = {
            value: key[1],
            withShift: '',
            withAltGr: '',
            withShiftAltGr: '',
          }
        }
        for (const strScanCode in rawMappings) {
          // eslint-disable-next-line no-prototype-builtins
          if (rawMappings.hasOwnProperty(strScanCode)) {
            const scanCode = ScanCodeUtils.toEnum(strScanCode)
            if (scanCode === ScanCode.None) {
              continue
            }
            if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== KeyCode.DependsOnKbLayout) {
              continue
            }
            this.scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`
          }
        }
      })
    } catch (_) {}
  }

  key2chord(key: string): Chord | null {
    return KeybindingParser.parse(key)
  }

  event2key(event: KeyboardEvent): string | null {
    const keyboardEvent = new StandardKeyboardEvent(event)
    if (keyboardEvent.equals(KeyCode.Escape)) {
      return null
    }
    if (keyboardEvent.equals(KeyCode.KEY_IN_COMPOSITION)) {
      return null
    }
    const chord = this.resolveKeyboardEvent(keyboardEvent)
    return this.getChordDispatch(chord)
  }

  event2chord(keyboardEvent: KeyboardEvent): Chord {
    const standardKeyboardEvent = new StandardKeyboardEvent(keyboardEvent)
    return this.resolveKeyboardEvent(standardKeyboardEvent)
  }

  private getChordDispatch(chord: Chord): string | null {
    if (chord instanceof KeyCodeChord) {
      return this.getChordDispatchWindows(chord)
    }
    if (chord instanceof ScanCodeChord) {
      return this.getChordDispatchMac(chord)
    }
    return null
  }

  private getChordDispatchWindows(chord: KeyCodeChord): string | null {
    if (chord.isModifierKey()) {
      return null
    }
    let result = ''

    if (chord.ctrlKey) {
      result += 'ctrl + '
    }
    if (chord.shiftKey) {
      result += 'shift + '
    }
    if (chord.altKey) {
      result += 'alt + '
    }
    if (chord.metaKey) {
      result += 'meta + '
    }
    result += KeyCodeUtils.toString(chord.keyCode)

    return result.toUpperCase()
  }

  private getChordDispatchMac(chord: ScanCodeChord): string | null {
    const codeDispatch = this.scanCodeToDispatch[chord.scanCode]
    if (!codeDispatch) {
      return null
    }
    let result = ''

    if (chord.ctrlKey) {
      result += 'ctrl + '
    }
    if (chord.shiftKey) {
      result += 'shift + '
    }
    if (chord.altKey) {
      result += 'alt + '
    }
    if (chord.metaKey) {
      result += 'meta + '
    }
    result += codeDispatch

    return result.toUpperCase()
  }

  private resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): Chord {
    const chord = this.isWindows
      ? this.resolveKeyboardEventWindows(keyboardEvent)
      : this.resolveKeyboardEventMac(keyboardEvent)
    return chord
  }

  private resolveKeyboardEventWindows(keyboardEvent: IKeyboardEvent): KeyCodeChord {
    const { ctrlKey, altKey } = keyboardEvent
    const chord = new KeyCodeChord(
      ctrlKey,
      keyboardEvent.shiftKey,
      altKey,
      keyboardEvent.metaKey,
      keyboardEvent.keyCode,
    )
    return chord
  }

  private resolveKeyboardEventMac(keyboardEvent: IKeyboardEvent): ScanCodeChord {
    let code = ScanCodeUtils.toEnum(keyboardEvent.code)
    // Treat NumpadEnter as Enter
    if (code === ScanCode.NumpadEnter) {
      code = ScanCode.Enter
    }

    const { keyCode } = keyboardEvent

    if (
      keyCode === KeyCode.LeftArrow ||
      keyCode === KeyCode.UpArrow ||
      keyCode === KeyCode.RightArrow ||
      keyCode === KeyCode.DownArrow ||
      keyCode === KeyCode.Delete ||
      keyCode === KeyCode.Insert ||
      keyCode === KeyCode.Home ||
      keyCode === KeyCode.End ||
      keyCode === KeyCode.PageDown ||
      keyCode === KeyCode.PageUp ||
      keyCode === KeyCode.Backspace
    ) {
      // "Dispatch" on keyCode for these key codes to workaround issues with remote desktoping software
      // where the scan codes appear to be incorrect (see https://github.com/microsoft/vscode/issues/24107)
      const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode]
      if (immutableScanCode !== ScanCode.DependsOnKbLayout) {
        code = immutableScanCode
      }
    } else if (
      code === ScanCode.Numpad1 ||
      code === ScanCode.Numpad2 ||
      code === ScanCode.Numpad3 ||
      code === ScanCode.Numpad4 ||
      code === ScanCode.Numpad5 ||
      code === ScanCode.Numpad6 ||
      code === ScanCode.Numpad7 ||
      code === ScanCode.Numpad8 ||
      code === ScanCode.Numpad9 ||
      code === ScanCode.Numpad0 ||
      code === ScanCode.NumpadDecimal
    ) {
      // "Dispatch" on keyCode for all numpad keys in order for NumLock to work correctly
      if (keyCode >= 0) {
        const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode]
        if (immutableScanCode !== ScanCode.DependsOnKbLayout) {
          code = immutableScanCode
        }
      }
    }

    const { ctrlKey, altKey } = keyboardEvent
    const chord = new ScanCodeChord(
      ctrlKey,
      keyboardEvent.shiftKey,
      altKey,
      keyboardEvent.metaKey,
      code,
    )
    return chord
  }
}
