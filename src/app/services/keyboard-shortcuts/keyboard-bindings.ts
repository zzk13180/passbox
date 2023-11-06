/* eslint-disable max-params */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable no-bitwise */

/* Original code: vscode/src/vs/base/common/keybinding.ts */

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode, ScanCode } from './keyboard-codes'

export interface Modifiers {
  readonly ctrlKey: boolean
  readonly shiftKey: boolean
  readonly altKey: boolean
  readonly metaKey: boolean
}

/**
 * Represents a chord which uses the `keyCode` field of keyboard events.
 * A chord is a combination of keys pressed simultaneously.
 */
export class KeyCodeChord implements Modifiers {
  constructor(
    public readonly ctrlKey: boolean,
    public readonly shiftKey: boolean,
    public readonly altKey: boolean,
    public readonly metaKey: boolean,
    public readonly keyCode: KeyCode,
  ) {}

  public equals(other: Chord): boolean {
    return (
      other instanceof KeyCodeChord &&
      this.ctrlKey === other.ctrlKey &&
      this.shiftKey === other.shiftKey &&
      this.altKey === other.altKey &&
      this.metaKey === other.metaKey &&
      this.keyCode === other.keyCode
    )
  }

  public getHashCode(): string {
    const ctrl = this.ctrlKey ? '1' : '0'
    const shift = this.shiftKey ? '1' : '0'
    const alt = this.altKey ? '1' : '0'
    const meta = this.metaKey ? '1' : '0'
    return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`
  }

  public isModifierKey(): boolean {
    return (
      this.keyCode === KeyCode.Unknown ||
      this.keyCode === KeyCode.Ctrl ||
      this.keyCode === KeyCode.Meta ||
      this.keyCode === KeyCode.Alt ||
      this.keyCode === KeyCode.Shift
    )
  }

  public toKeybinding(): Keybinding {
    return new Keybinding([this])
  }

  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  public isDuplicateModifierCase(): boolean {
    return (
      (this.ctrlKey && this.keyCode === KeyCode.Ctrl) ||
      (this.shiftKey && this.keyCode === KeyCode.Shift) ||
      (this.altKey && this.keyCode === KeyCode.Alt) ||
      (this.metaKey && this.keyCode === KeyCode.Meta)
    )
  }
}

/**
 * Represents a chord which uses the `code` field of keyboard events.
 * A chord is a combination of keys pressed simultaneously.
 */
export class ScanCodeChord implements Modifiers {
  constructor(
    public readonly ctrlKey: boolean,
    public readonly shiftKey: boolean,
    public readonly altKey: boolean,
    public readonly metaKey: boolean,
    public readonly scanCode: ScanCode,
  ) {}

  public equals(other: Chord): boolean {
    return (
      other instanceof ScanCodeChord &&
      this.ctrlKey === other.ctrlKey &&
      this.shiftKey === other.shiftKey &&
      this.altKey === other.altKey &&
      this.metaKey === other.metaKey &&
      this.scanCode === other.scanCode
    )
  }

  public getHashCode(): string {
    const ctrl = this.ctrlKey ? '1' : '0'
    const shift = this.shiftKey ? '1' : '0'
    const alt = this.altKey ? '1' : '0'
    const meta = this.metaKey ? '1' : '0'
    return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`
  }

  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  public isDuplicateModifierCase(): boolean {
    return (
      (this.ctrlKey &&
        (this.scanCode === ScanCode.ControlLeft ||
          this.scanCode === ScanCode.ControlRight)) ||
      (this.shiftKey &&
        (this.scanCode === ScanCode.ShiftLeft ||
          this.scanCode === ScanCode.ShiftRight)) ||
      (this.altKey &&
        (this.scanCode === ScanCode.AltLeft || this.scanCode === ScanCode.AltRight)) ||
      (this.metaKey &&
        (this.scanCode === ScanCode.MetaLeft || this.scanCode === ScanCode.MetaRight))
    )
  }
}

export type Chord = KeyCodeChord | ScanCodeChord

/**
 * A keybinding is a sequence of chords.
 */
export class Keybinding {
  public readonly chords: Chord[]

  constructor(chords: Chord[]) {
    if (chords.length === 0) {
      console.warn('BAD keybinding, no chords')
    }
    this.chords = chords
  }

  public getHashCode(): string {
    let result = ''
    for (let i = 0, len = this.chords.length; i < len; i++) {
      if (i !== 0) {
        result += ';'
      }
      result += this.chords[i].getHashCode()
    }
    return result
  }

  public equals(other: Keybinding | null): boolean {
    if (other === null) {
      return false
    }
    if (this.chords.length !== other.chords.length) {
      return false
    }
    for (let i = 0; i < this.chords.length; i++) {
      if (!this.chords[i].equals(other.chords[i])) {
        return false
      }
    }
    return true
  }
}

export class ResolvedChord {
  constructor(
    public readonly ctrlKey: boolean,
    public readonly shiftKey: boolean,
    public readonly altKey: boolean,
    public readonly metaKey: boolean,
    public readonly keyLabel: string | null,
    public readonly keyAriaLabel: string | null,
  ) {}
}

export type SingleModifierChord = 'ctrl' | 'shift' | 'alt' | 'meta'

/**
 * A resolved keybinding. Consists of one or multiple chords.
 */
export abstract class ResolvedKeybinding {
  /**
   * This prints the binding in a format suitable for displaying in the UI.
   */
  public abstract getLabel(): string | null
  /**
   * This prints the binding in a format suitable for ARIA.
   */
  public abstract getAriaLabel(): string | null
  /**
   * This prints the binding in a format suitable for electron's accelerators.
   * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
   */
  public abstract getElectronAccelerator(): string | null
  /**
   * This prints the binding in a format suitable for user settings.
   */
  public abstract getUserSettingsLabel(): string | null
  /**
   * Is the user settings label reflecting the label?
   */
  public abstract isWYSIWYG(): boolean
  /**
   * Does the keybinding consist of more than one chord?
   */
  public abstract hasMultipleChords(): boolean
  /**
   * Returns the chords that comprise of the keybinding.
   */
  public abstract getChords(): ResolvedChord[]
  /**
   * Returns the chords as strings useful for dispatching.
   * Returns null for modifier only chords.
   * @example keybinding "Shift" -> null
   * @example keybinding ("D" with shift == true) -> "shift+D"
   */
  public abstract getDispatchChords(): (string | null)[]
  /**
   * Returns the modifier only chords as strings useful for dispatching.
   * Returns null for chords that contain more than one modifier or a regular key.
   * @example keybinding "Shift" -> "shift"
   * @example keybinding ("D" with shift == true") -> null
   */
  public abstract getSingleModifierDispatchChords(): (SingleModifierChord | null)[]
}
