import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core'
import Fuse from 'fuse.js'
import { LyClasses, LyTheme2 } from '@alyle/ui'
import { EmojiService } from './emoji.service'
import { emojisTmpData } from './emoji.data'
import type { Emoji } from './emoji.data'

const STYLES = {
  slider: {
    width: '100%',
    position: 'fixed',
    top: '40px',
    left: 0,
  },
}

@Component({
  selector: 'apps-emoji',
  templateUrl: './emoji.component.html',
  styleUrls: ['./emoji.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmojiComponent implements OnInit {
  readonly classes: LyClasses<typeof STYLES>
  fontSize = 26
  emojis: Emoji[] = []
  private emojisOriginal: Emoji[] = []
  private fuse = new Fuse<Emoji>([], {
    keys: [
      'title',
      'symbol',
      'keywords',
      'titleI18n.English',
      'titleI18n.Chinese',
      'titleI18n.Japanese',
      'titleI18n.Spanish',
      'titleI18n.German',
      'titleI18n.French',
      'titleI18n.Italian',
      'titleI18n.Portuguese',
      'titleI18n.Polish',
      'titleI18n.Arabic',
      'titleI18n.Persian',
      'titleI18n.Indonesian',
      'titleI18n.Dutch',
      'keywordsI18n.English',
      'keywordsI18n.Chinese',
      'keywordsI18n.Japanese',
      'keywordsI18n.Spanish',
      'keywordsI18n.German',
      'keywordsI18n.Russian',
      'keywordsI18n.French',
      'keywordsI18n.Italian',
      'keywordsI18n.Portuguese',
      'keywordsI18n.Polish',
      'keywordsI18n.Arabic',
      'keywordsI18n.Persian',
      'keywordsI18n.Indonesian',
      'keywordsI18n.Dutch',
    ],
    useExtendedSearch: true,
    threshold: 0.4,
    ignoreLocation: true,
    sortFn: (a, b) => a.score - b.score,
  })

  constructor(
    private theme: LyTheme2,
    private _cd: ChangeDetectorRef,
    private emojiService: EmojiService,
  ) {
    this.classes = this.theme.addStyleSheet(STYLES)
  }

  ngOnInit() {
    const { emojis } = this.emojiService
    if (emojis) {
      this.initEmojis(emojis)
      return
    }
    this.emojis = emojisTmpData
    this._cd.markForCheck()
    this.emojiService.getEmojis().then(emojis => {
      setTimeout(() => {
        this.initEmojis(emojis)
      }, 300)
    })
  }

  private initEmojis(emojis: Emoji[]) {
    this.emojis = emojis
    this.emojisOriginal = emojis
    this.fuse.setCollection(emojis)
    this._cd.markForCheck()
  }

  onSearch(term: string) {
    if (term === '') {
      this.emojis = this.emojisOriginal
    } else {
      const result = this.fuse.search(term || null).map(item => item.item)
      this.emojis = result
    }
  }

  sliderChange(event: any) {
    const { value } = event
    this.fontSize = value
  }

  trackByFn(index: number, item: Emoji) {
    return item.symbol
  }
}
