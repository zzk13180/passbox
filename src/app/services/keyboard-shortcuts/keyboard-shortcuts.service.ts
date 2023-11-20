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
          if (Object.prototype.hasOwnProperty.call(rawMappings, strScanCode)) {
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
    return KeybindingParser.key2Chord(key)
  }

  key2ElectronAccelerator(key: string): string {
    if (key === '') {
      return key
    }
    const result = this.isWindows
      ? this.key2ElectronAcceleratorWindows(key)
      : this.key2ElectronAcceleratorMac(key)
    if (result === null) {
      return key.replace(/ |\[Key|\]/g, '') // fallback
    }
    return result
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

  private key2ElectronAcceleratorWindows(key: string): string | null {
    const chord = KeybindingParser.key2Chord(key) as KeyCodeChord
    if (!chord) {
      return null
    }
    if (chord.isModifierKey()) {
      return null
    }
    let result = ''

    if (chord.ctrlKey) {
      result += 'ctrl+'
    }
    if (chord.shiftKey) {
      result += 'shift+'
    }
    if (chord.altKey) {
      result += 'alt+'
    }
    result += KeyCodeUtils.toElectronAccelerator(chord.keyCode)
    return result
  }

  private key2ElectronAcceleratorMac(key: string): string | null {
    const chord = KeybindingParser.key2Chord(key) as ScanCodeChord
    if (!chord) {
      return null
    }
    let result = ''

    if (chord.ctrlKey) {
      result += 'ctrl+'
    }
    if (chord.shiftKey) {
      result += 'shift+'
    }
    if (chord.altKey) {
      result += 'alt+'
    }
    if (chord.metaKey) {
      result += 'cmd+'
    }

    const constantKeyCode: KeyCode = this.guessStableKeyCode(chord.scanCode)

    if (constantKeyCode !== KeyCode.DependsOnKbLayout) {
      result += KeyCodeUtils.toElectronAccelerator(constantKeyCode)
      return result
    }
    return null
  }

  // easy guess for stable key codes TODO: improve
  private guessStableKeyCode(scanCode: ScanCode): KeyCode {
    const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode]
    if (immutableKeyCode !== KeyCode.DependsOnKbLayout) {
      return immutableKeyCode
    }

    switch (scanCode) {
      case ScanCode.KeyA:
        return KeyCode.KeyA
      case ScanCode.KeyB:
        return KeyCode.KeyB
      case ScanCode.KeyC:
        return KeyCode.KeyC
      case ScanCode.KeyD:
        return KeyCode.KeyD
      case ScanCode.KeyE:
        return KeyCode.KeyE
      case ScanCode.KeyF:
        return KeyCode.KeyF
      case ScanCode.KeyG:
        return KeyCode.KeyG
      case ScanCode.KeyH:
        return KeyCode.KeyH
      case ScanCode.KeyI:
        return KeyCode.KeyI
      case ScanCode.KeyJ:
        return KeyCode.KeyJ
      case ScanCode.KeyK:
        return KeyCode.KeyK
      case ScanCode.KeyL:
        return KeyCode.KeyL
      case ScanCode.KeyM:
        return KeyCode.KeyM
      case ScanCode.KeyN:
        return KeyCode.KeyN
      case ScanCode.KeyO:
        return KeyCode.KeyO
      case ScanCode.KeyP:
        return KeyCode.KeyP
      case ScanCode.KeyQ:
        return KeyCode.KeyQ
      case ScanCode.KeyR:
        return KeyCode.KeyR
      case ScanCode.KeyS:
        return KeyCode.KeyS
      case ScanCode.KeyT:
        return KeyCode.KeyT
      case ScanCode.KeyU:
        return KeyCode.KeyU
      case ScanCode.KeyV:
        return KeyCode.KeyV
      case ScanCode.KeyW:
        return KeyCode.KeyW
      case ScanCode.KeyX:
        return KeyCode.KeyX
      case ScanCode.KeyY:
        return KeyCode.KeyY
      case ScanCode.KeyZ:
        return KeyCode.KeyZ
      case ScanCode.Digit1:
        return KeyCode.Digit1
      case ScanCode.Digit2:
        return KeyCode.Digit2
      case ScanCode.Digit3:
        return KeyCode.Digit3
      case ScanCode.Digit4:
        return KeyCode.Digit4
      case ScanCode.Digit5:
        return KeyCode.Digit5
      case ScanCode.Digit6:
        return KeyCode.Digit6
      case ScanCode.Digit7:
        return KeyCode.Digit7
      case ScanCode.Digit8:
        return KeyCode.Digit8
      case ScanCode.Digit9:
        return KeyCode.Digit9
      case ScanCode.Digit0:
        return KeyCode.Digit0
      case ScanCode.Minus:
        return KeyCode.Minus
      case ScanCode.Equal:
        return KeyCode.Equal
      case ScanCode.BracketLeft:
        return KeyCode.BracketLeft
      case ScanCode.BracketRight:
        return KeyCode.BracketRight
      case ScanCode.Backslash:
        return KeyCode.Backslash
      case ScanCode.IntlHash:
        return KeyCode.Unknown // missing
      case ScanCode.Semicolon:
        return KeyCode.Semicolon
      case ScanCode.Quote:
        return KeyCode.Quote
      case ScanCode.Backquote:
        return KeyCode.Backquote
      case ScanCode.Comma:
        return KeyCode.Comma
      case ScanCode.Period:
        return KeyCode.Period
      case ScanCode.Slash:
        return KeyCode.Slash
      case ScanCode.IntlBackslash:
        return KeyCode.IntlBackslash
    }
    return KeyCode.Unknown
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
      result += 'cmd + '
    }
    result = result.toUpperCase() + codeDispatch

    return result
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
