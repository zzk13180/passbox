/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
show cards modification history in a dialog
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core'
import { LyTheme2, LyClasses } from '@alyle/ui'
import { LyDialog } from '@alyle/ui/dialog'
import { filter, take } from 'rxjs'
import { Store } from '@ngrx/store'
import {
  add,
  ElectronService,
  CryptoService,
  selectCards,
  MessageService,
} from 'src/app/services'
import { StorageKey } from 'src/app/enums'
import { fromB64ToStr } from 'src/app/utils/crypto.util'
import { ImportPasswordDialog } from '../import/import-password-dialog.component'
import { STYLES } from './STYLES.data'
import type { CipherString, Card, UserState } from 'src/app/models'

type Version = { version: string; state: boolean; title: string; content: string }

@Component({
  selector: 'card-history-dialog',
  templateUrl: './card-history-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHistoryDialog implements OnInit {
  readonly classes: LyClasses<typeof STYLES>
  isArray = Array.isArray
  versions: Version[]
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
    private electronService: ElectronService,
    private cd: ChangeDetectorRef,
    private crypto: CryptoService,
    private ngZone: NgZone,
    private store: Store,
    private messages: MessageService,
  ) {
    this.classes = this._theme.addStyleSheet(STYLES)
  }

  async ngOnInit() {
    const vserionsStr = await this.electronService.cardsStorageGet(StorageKey.versions)
    this.versions = vserionsStr
      .split(',')
      .filter(Boolean)
      .map(version => ({
        version,
        state: false,
        title: this.parseVersion(version),
        content: '',
      }))
    this.cd.markForCheck()
  }

  viewMenu(version: Version, card: Card) {
    const menus = [
      {
        label: 'restore',
        cb: () => {
          this.restore([card])
        },
      },
      {
        label: 'restore all',
        cb: () => {
          // @ts-ignore
          this.restore(version.content)
        },
      },
    ]
    const { menu } = window.electronAPI
    menu.popupMenu(menus)
  }

  panelViewMenu(version: Version) {
    const menus = [
      {
        label: 'view',
        cb: () => {
          version.state = true
          this.cd.detectChanges()
        },
      },
      {
        label: 'delete',
        cb: () => {
          this.delVersion(version)
        },
      },
    ]
    const { menu } = window.electronAPI
    menu.popupMenu(menus)
  }

  async getContent(version: string, index: number) {
    if (this.versions[index].content) {
      return
    }
    const str = await this.getHistoryItem(version)
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
    // Do I need to show deleted cards? Do i need hide repeated cards?
    this.versions[index].content = JSON.parse(decryptStr).items.map((item: Card) => ({
      title: item.title,
      description: item.description,
      url: item.url,
    }))
    this.cd.markForCheck()
  }

  private parseVersion(version: string) {
    const [year, month, day, hour, minute, second] = version.split('-')
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`
  }

  private restore(cards: Card[]) {
    if (Array.isArray(cards) && !cards.length) {
      this.openMessage('Data is Empty Or Not Available')
      return
    }
    this.store
      .select(selectCards)
      .pipe(take(1))
      .subscribe(existsCards => {
        const keys = ['title', 'description', 'secret', 'url']
        const addCards = cards
          .map((card: Card) => {
            const tmp = { ...card }
            keys.forEach(key => (tmp[key] = tmp[key] ?? ''))
            return tmp
          })
          .filter(
            (card: Card) =>
              !existsCards.some(
                (item: Card) =>
                  item.id === card.id || keys.every(key => item[key] === card[key]),
              ),
          )
        if (!addCards.length) {
          this.openMessage('No data need to be restored')
        } else {
          this.store.dispatch(add({ cards: addCards }))
          this.openMessage(`Restore ${addCards.length} cards successfully`)
        }
      })
  }

  private delVersion(version: Version) {
    const { dialog } = window.electronAPI
    dialog.showMessageBox(
      {
        type: 'question',
        message: 'Delete history version',
        detail: 'Are you sure to delete this history version?',
        buttons: ['Cancel', 'Yes'],
        defaultId: 1,
        cancelId: 0,
        noLink: true,
      },
      result => {
        result.response === 1 &&
          this.ngZone.run(async () => {
            this.versions = this.versions.filter(item => item.version !== version.version)
            try {
              const value = this.versions.map(item => item.version).join(',')
              await this.electronService.cardsStorageSave(StorageKey.versions, value)
            } catch (error) {
              this.openMessage('Delete failed')
            }
            this.openMessage(`Delete ${version.title} successfully`)
            this.cd.markForCheck()
          })
      },
    )
  }

  private async getHistoryItem(version: string): Promise<string | null> {
    let data = null
    try {
      data = await this.electronService.cardsStorageGetHistoryItem(version)
    } catch (_) {
      return null
    }
    try {
      const value = JSON.parse(data)
      if (!value || !value.cards || !value.userState) {
        return null
      }
    } catch (_) {
      return null
    }
    return data
  }

  private openMessage(msg: string) {
    this.ngZone.run(() => {
      this.messages.open({
        msg,
      })
    })
  }
}
