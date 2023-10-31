import { Injectable } from '@angular/core'
import type { Emoji } from './emoji.data'

@Injectable()
export class EmojiService {
  emojis: Emoji[]
  constructor() {}

  async getEmojis() {
    if (!this.emojis) {
      const { default: emojis } = await import('./emojis.json')
      this.emojis = emojis
    }
    return this.emojis
  }
}
