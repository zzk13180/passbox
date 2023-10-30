import { Injectable, Inject } from '@angular/core'
import { DOCUMENT } from '@angular/common'

@Injectable({
  providedIn: 'root',
})
export class KeyboardService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  #platform: string = window.electronAPI.process.platform

  #symbols = {
    meta: '\u2318', // ⌘
    shift: '\u21E7', // ⇧
    left: '\u2190', // ←
    right: '\u2192', // →
    up: '\u2191', // ↑
    down: '\u2193', // ↓
    return: '\u23CE', // ⏎
    backspace: '\u232B', // ⌫
  }

  #_MAP = new Map<number, string>([
    [8, 'backspace'],
    [9, 'tab'],
    [13, 'enter'],
    [16, 'shift'],
    [17, 'ctrl'],
    [18, 'alt'],
    [20, 'capslock'],
    [27, 'esc'],
    [32, 'space'],
    [33, 'pageup'],
    [34, 'pagedown'],
    [35, 'end'],
    [36, 'home'],
    [37, 'left'],
    [38, 'up'],
    [39, 'right'],
    [40, 'down'],
    [45, 'ins'],
    [46, 'del'],
    [91, 'meta'],
    [93, 'meta'],
    [96, '0'],
    [97, '1'],
    [98, '2'],
    [99, '3'],
    [100, '4'],
    [101, '5'],
    [102, '6'],
    [103, '7'],
    [104, '8'],
    [105, '9'],
    [112, 'f1'],
    [113, 'f2'],
    [114, 'f3'],
    [115, 'f4'],
    [116, 'f5'],
    [117, 'f6'],
    [118, 'f7'],
    [119, 'f8'],
    [120, 'f9'],
    [121, 'f10'],
    [122, 'f11'],
    [123, 'f12'],
    [124, 'f13'],
    [125, 'f14'],
    [126, 'f15'],
    [127, 'f16'],
    [128, 'f17'],
    [129, 'f18'],
    [130, 'f19'],
    [224, 'meta'],
  ])

  #_KEYCODE_MAP = new Map<number, string>([
    [106, '*'],
    [107, '+'],
    [109, '-'],
    [110, '.'],
    [111, '/'],
    [186, ';'],
    [187, '='],
    [188, ','],
    [189, '-'],
    [190, '.'],
    [191, '/'],
    [192, '`'],
    [219, '['],
    [220, '\\'],
    [221, ']'],
    [222, "'"],
  ])

  #_SHIFT_MAP: Record<string, string> = {
    '"': "'",
    ':': ';',
    '?': '/',
    '>': '.',
    '<': ',',
    '{': '[',
    '}': ']',
    '|': '\\',
    '!': '1',
    '@': '2',
    '#': '3',
    $: '4',
    '%': '5',
    '^': '6',
    '&': '7',
    '*': '8',
    '(': '9',
    ')': '0',
    '~': '`',
  }

  #_SPECIAL_ALIASES = {
    option: 'alt',
    command: 'meta',
    return: 'enter',
    escape: 'esc',
    plus: '+',
    mod: this.#platform === 'darwin' ? 'meta' : 'ctrl',
  }

  equals() {}

  allowIn(): boolean {
    return true
  }

  // runOutsideAngular
}
