import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core'
import Fuse from 'fuse.js'
import { LyClasses, LyTheme2 } from '@alyle/ui'
import { LyDialog } from '@alyle/ui/dialog'
import { AppsDialog } from 'src/app/home/components/apps-dialog/apps-dialog.component'
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
  fontSize = 22
  emojis: Emoji[] = []
  private emojisOriginal: Emoji[] = []
  private loading = true
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
    private _dialog: LyDialog,
    private theme: LyTheme2,
    private _cd: ChangeDetectorRef,
    private emojiService: EmojiService,
  ) {
    this.classes = this.theme.addStyleSheet(STYLES)
  }

  async ngOnInit() {
    const { emojis } = this.emojiService
    console.log(emojis)
    if (emojis) {
      this.initEmojis(emojis)
      return
    }
    this.emojiService.getEmojis().then(emojis => {
      setTimeout(() => {
        this.initEmojis(emojis)
      }, 500)
    })
    const iterator = this.displayEmojiOneByOne(emojisTmpData)
    while (true) {
      const { value, done } = await iterator.next()
      if (done || !this.loading) {
        break
      }
      this.emojis.push(...value)
      this._cd.markForCheck()
    }
  }

  private initEmojis(emojis: Emoji[]) {
    this.loading = false
    this.emojis = emojis
    this.emojisOriginal = emojis
    this.fuse.setCollection(emojis)
    this._cd.markForCheck()
  }

  private async *displayEmojiOneByOne(emojis: Emoji[]) {
    const arrs = []
    const chunk = 7
    for (let i = 0; i < emojis.length; i += chunk) {
      arrs.push(emojis.slice(i, i + chunk))
    }
    for (const emojis of arrs) {
      await new Promise(resolve => setTimeout(resolve, 50))
      yield emojis
    }
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

  openAppsDialog() {
    this._dialog.open<AppsDialog>(AppsDialog, {})
  }

  trackByFn(index: number, item: Emoji) {
    return item.symbol
  }
}
