/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
show cards modification history in a dialog
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core'
import { LyTheme2, LyClasses } from '@alyle/ui'
import { LyDialog } from '@alyle/ui/dialog'
import { filter, take } from 'rxjs'
import { CardsDbService, CryptoService } from 'src/app/services'
import { fromB64ToStr } from 'src/app/utils/crypto.util'
import { ImportPasswordDialog } from '../import/import-password-dialog.component'
import { STYLES } from './STYLES.data'
import type { UserState } from 'src/app/services'
import type { CipherString, Card } from 'src/app/models'

@Component({
  selector: 'aui-custom-expansion-panel',
  templateUrl: './card-history-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHistoryDialog implements OnInit {
  readonly classes: LyClasses<typeof STYLES>
  isArray = Array.isArray
  versions: { version: string; state: boolean; title: string; content: string }[] = []
  columns = [
    {
      columnDef: 'title',
      header: 'title',
      cell: (card: Card) => `${card.title}`,
    },
    {
      columnDef: 'description',
      header: 'description',
      cell: (card: Card) => `${card.description}`,
    },
    {
      columnDef: 'url',
      header: 'url',
      cell: (card: Card) => `${card.url}`,
    },
  ]

  displayedColumns = this.columns.map(c => c.columnDef)

  // eslint-disable-next-line max-params
  constructor(
    private _theme: LyTheme2,
    private _dialog: LyDialog,
    private db: CardsDbService,
    private cd: ChangeDetectorRef,
    private crypto: CryptoService,
  ) {
    this.classes = this._theme.addStyleSheet(STYLES)
  }

  async ngOnInit() {
    const vserionsStr = await this.db.getVersions()
    this.versions = vserionsStr
      .split(',')
      .filter(Boolean)
      .map(version => ({
        version,
        state: false,
        title: this.parseVersion(version),
        content: '',
      }))
      .reverse()
    // remove the last two versions because they are initial data has no content
    this.versions.pop()
    this.versions.pop()
    this.cd.markForCheck()
  }

  private parseVersion(version: string) {
    const [year, month, day, hour, minute, second] = version.split('-')
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`
  }

  async getContent(version: string, index: number) {
    if (this.versions[index].content) {
      return
    }
    const str = await this.db.getHistoryItem(version)
    if (!str) {
      this.versions[index].content = 'Data is Empty Or Not Available'
      this.cd.markForCheck()
      return
    }
    try {
      const { cards: cardsStr, userState: userStateStr } = JSON.parse(str)
      const userState: UserState = JSON.parse(fromB64ToStr(userStateStr))
      const cards = JSON.parse(cardsStr)
      const { isRequiredLogin } = userState
      if (isRequiredLogin) {
        const dialogRef = this._dialog.open<ImportPasswordDialog>(ImportPasswordDialog, {
          width: 320,
        })
        dialogRef.afterClosed.pipe(filter(Boolean), take(1)).subscribe(async result => {
          const { password: userPassword } = result
          try {
            await this.handleDecryption(cards, userState, index, userPassword)
          } catch (error) {
            const { dialog } = window.electronAPI
            dialog.showMessageBox(
              {
                type: 'error',
                title: 'Error',
                message: 'Decrypt Error',
              },
              () => {},
            )
          }
        })
      } else {
        await this.handleDecryption(cards, userState, index)
      }
    } catch (error) {
      this.versions[index].content = 'Data is Empty Or Not Available'
      this.cd.markForCheck()
    }
  }

  private async handleDecryption(
    cards: CipherString,
    userState: UserState,
    index: number,
    userPassword?: string,
  ) {
    const decryptStr = await this.crypto.decryptToUtf8WithExternalUserState(
      cards,
      userState,
      userPassword,
    )
    this.versions[index].content = JSON.parse(decryptStr).items.map((item: Card) => ({
      title: item.title,
      description: item.description,
      url: item.url,
    }))
    this.cd.markForCheck()
  }
}
