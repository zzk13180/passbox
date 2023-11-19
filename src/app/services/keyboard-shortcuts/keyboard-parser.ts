/* eslint-disable no-useless-escape */
/* Original code: vscode/src/vs/base/common/keybindingParser.ts (is modified) */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCodeUtils, ScanCodeUtils } from './keyboard-codes'
import { KeyCodeChord, ScanCodeChord, Chord } from './keyboard-bindings'

export class KeybindingParser {
  private static _readModifiers(input: string) {
    input = input.toLowerCase().trim().replace(/ /g, '')

    let ctrl = false
    let shift = false
    let alt = false
    let meta = false

    let matchedModifier: boolean

    do {
      matchedModifier = false
      if (/^ctrl(\+|\-)/.test(input)) {
        ctrl = true
        input = input.substr('ctrl-'.length)
        matchedModifier = true
      }
      if (/^shift(\+|\-)/.test(input)) {
        shift = true
        input = input.substr('shift-'.length)
        matchedModifier = true
      }
      if (/^alt(\+|\-)/.test(input)) {
        alt = true
        input = input.substr('alt-'.length)
        matchedModifier = true
      }
      if (/^meta(\+|\-)/.test(input)) {
        meta = true
        input = input.substr('meta-'.length)
        matchedModifier = true
      }
      if (/^win(\+|\-)/.test(input)) {
        meta = true
        input = input.substr('win-'.length)
        matchedModifier = true
      }
      if (/^cmd(\+|\-)/.test(input)) {
        meta = true
        input = input.substr('cmd-'.length)
        matchedModifier = true
      }
    } while (matchedModifier)

    return {
      ctrl,
      shift,
      alt,
      meta,
      key: input,
    }
  }

  static parse(input: string): Chord | null {
    if (!input) {
      return null
    }
    const mods = this._readModifiers(input)
    const scanCodeMatch = mods.key.match(/^\[([^\]]+)\]$/)
    if (scanCodeMatch) {
      const strScanCode = scanCodeMatch[1]
      const scanCode = ScanCodeUtils.lowerCaseToEnum(strScanCode)
      return new ScanCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, scanCode)
    }
    const keyCode = KeyCodeUtils.fromUserSettings(mods.key)
    return new KeyCodeChord(mods.ctrl, mods.shift, mods.alt, mods.meta, keyCode)
  }
}
