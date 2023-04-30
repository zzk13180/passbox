import {
  Component,
  OnInit,
  Inject,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  NgZone,
} from '@angular/core'
import { StyleRenderer, lyl, ThemeVariables, ThemeRef, LyTheme2 } from '@alyle/ui'
import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { LyDialog, LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { STYLES as EXPANSION_STYLES } from '@alyle/ui/expansion'
import { LySnackBar } from '@alyle/ui/snack-bar'
import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { v4 as uuid } from 'uuid'
import { StorageKey, DBError } from '../../enums/storageKey'
import { Card, CardState, CardFieldMap } from '../../models'
import {
  ElectronService,
  add,
  sort,
  modify,
  remove,
  search,
  restore,
  initCards,
  selectCards,
  selectDeletedCards,
  selectSearchTerm,
  UserState,
  UserStateService,
  DbService,
  CryptoService,
} from '../../services'
import { CipherString } from '../../models/domain/cipherString'
import { PasswordSet } from './password-set-dialog.component'
import { SelectExportDialog } from './select-export-dialog'
import { ImportPasswordDialog } from './import-password-dialog'

const STYLES = (theme: ThemeVariables, ref: ThemeRef) => {
  const expansion = ref.selectorsOf(EXPANSION_STYLES)
  return {
    $name: 'home-panel',
    title: () => lyl`{
      margin: 0
      width: 100%
      height: 54px
      line-height: 54px
      position: relative
      top: 0
      left: 0
      &>span {
        margin: 0 0 0 16px
        width: calc(100% - 32px)
        cursor: pointer
        overflow: hidden
        white-space: nowrap
        text-overflow: ellipsis
        span {
          cursor: text
        }
      }
    }`,
    panel: () => lyl`{
      ${expansion.panelHeader} {
        height: 54px
        width: 100vw
        padding: 0
      }
      ${expansion.panelTitle} {
        font-weight: 500
      }
      &::after {
        transition: border ${theme.animations.durations.entering}ms ${theme.animations.curves.standard}
        content: ''
        position: absolute
        top: 0
        bottom: 0
        ${theme.before}: 0
        border-${theme.before}: 2px solid transparent
      }
    }`,
    accordion: () => {
      return lyl`{
        ${expansion.expanded} {
          ${expansion.panelHeader} {
            height: 54px
          }
          &${expansion.panel} {
            &::after {
              border-${theme.before}: 2px solid ${theme.primary.default}
            }
          }
          ${expansion.panelHeader} ${expansion.panelTitle} {
            color: ${theme.primary.default}
          }
        }
        ${expansion.panelBody} {
          padding: 0
          width: 100vw
        }
      }`
    },
    dialog: lyl`{
      width: 100vw
      height: 100vh
      border-radius: 0
    }`,
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StyleRenderer],
})
export class HomeComponent implements OnInit {
  @ViewChild('sb') sb: LySnackBar
  classes: any
  cards$: Observable<Array<Card>>
  deletedCards$: Observable<Array<Card>>
  searchTerm$: Observable<string>

  // eslint-disable-next-line max-params
  constructor(
    readonly sRenderer: StyleRenderer,
    private _theme: LyTheme2,
    private electronService: ElectronService,
    private _dialog: LyDialog,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private _el: ElementRef,
    private store: Store<{ theCards: CardState }>,
    private userStateService: UserStateService,
    private dbService: DbService,
    private cryptoService: CryptoService,
  ) {}

  async ngOnInit() {
    this.classes = this._theme.addStyleSheet(STYLES)
    const theCardsStore = this.store.select('theCards')
    this.cards$ = theCardsStore.pipe(select(selectCards))
    this.deletedCards$ = theCardsStore.pipe(select(selectDeletedCards))
    this.searchTerm$ = theCardsStore.pipe(select(selectSearchTerm))
    const { isRequiredLogin } = await this.userStateService.getUserState()
    if (isRequiredLogin) {
      this.setPassword(true)
    } else {
      this.initTheCards()
    }
    this._el.nativeElement.addEventListener('drop', (e: DragEvent) => {
      if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        const { name, path } = file
        if (name && path) {
          const cards = [
            {
              id: uuid(),
              title: name,
              description: '',
              secret: '',
              url: path,
              width: 800,
              height: 600,
            },
          ]
          this.store.dispatch(add({ cards }))
        }
      }
    })
    this._el.nativeElement.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault()
    })
  }

  private async initTheCards(): Promise<void> {
    try {
      const theCards = await this.dbService.getItem(StorageKey.cards)
      if (theCards) {
        this.store.dispatch(initCards({ theCards }))
      }
    } catch (err) {
      if (err.message === DBError.noData) {
        const cards = [
          {
            id: uuid(),
            title: 'Right-click to open the official website.',
            url: 'https://zzk13180.github.io/passbox/',
            description: '',
            secret: '',
            width: 800,
            height: 600,
          },
          {
            id: uuid(),
            title: 'All user data is stored in this file.',
            url: `${this.electronService.remote.app.getPath('userData')}/passbox.json`,
            description: '',
            secret: '',
            width: 800,
            height: 600,
          },
        ]
        this.store.dispatch(add({ cards }))
      }
    }
  }

  setPassword(isLogin?: boolean) {
    const dialogRef = this._dialog.open<PasswordSet, { isLogin: boolean }>(PasswordSet, {
      width: null,
      height: null,
      maxWidth: null,
      maxHeight: null,
      containerClass: this.classes.dialog,
      data: { isLogin },
      disableClose: true,
    })
    dialogRef.afterClosed.subscribe(result => {
      result && this.initTheCards()
    })
  }

  copyText(event: Event) {
    event.stopPropagation()
  }

  copy(card: Card, field: string): void {
    if (!card[field]) {
      return
    }
    this.electronService.copyText(card[field])
    this.sb.open({
      msg: `${CardFieldMap[field]} is copied`,
    })
  }

  add() {
    this.ngZone.run(() => {
      this.openDialog('add')
      this._cd.detectChanges()
    })
  }

  modify(card: Card) {
    this.ngZone.run(() => {
      this.openDialog('modify', card)
      this._cd.detectChanges()
    })
  }

  del(card: Card) {
    this.electronService.remote.dialog
      .showMessageBox(this.electronService.remote.BrowserWindow.getFocusedWindow(), {
        type: 'question',
        title: 'confirm',
        message: 'delete card',
        detail: 'are you sure to delete this card?',
        buttons: ['yes', 'cancel'],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      })
      .then(result => {
        if (result.response === 0) {
          this.ngZone.run(() => {
            this.store.dispatch(remove({ card }))
            this._cd.detectChanges()
          })
        }
      })
  }

  openBrowser(card: Card, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    this.electronService.openBrowser(card)
  }

  openDialog(flag: string, card?: Card) {
    this._dialog
      .open<AddDialog, Card>(AddDialog, {
        data: {
          id: card?.id ?? uuid(),
          title: card?.title ?? '',
          description: card?.description ?? '',
          secret: card?.secret ?? '',
          url: card?.url ?? '',
          width: card?.width ?? 800,
          height: card?.height ?? 600,
        },
      })
      .afterClosed.pipe(filter(result => !!result))
      .subscribe(card => {
        let msg = ''
        if (flag === 'add') {
          this.store.dispatch(add({ cards: [card] }))
          msg = 'add success'
        }
        if (flag === 'modify') {
          this.store.dispatch(modify({ card }))
          msg = 'modify success'
        }
        this.sb.open({
          msg,
        })
        this._cd.markForCheck()
      })
  }

  showDeletedCards() {
    let data: Card[] = []
    this.deletedCards$.subscribe(cards => (data = cards)).unsubscribe()
    this._dialog.open<DeletedCardsDialog, Card[]>(DeletedCardsDialog, { data })
  }

  exportData(event: Event): void {
    event.stopPropagation()
    const dialogRef = this._dialog.open<SelectExportDialog>(SelectExportDialog, {
      width: 320,
    })
    dialogRef.afterClosed.pipe(filter(result => !!result)).subscribe(result => {
      switch (result.option) {
        case 'plain':
          this.exportDataPlain()
          break
        case 'encrypted':
          this.exportEncryptedData()
          break
        case 'html':
          this.exportDataHtml()
          break
        default:
          this.exportEncryptedData()
          break
      }
    })
  }

  private async exportDataPlain() {
    try {
      const theCards: CardState = await this.dbService.getItem(StorageKey.cards)
      this.downloadByData(JSON.stringify(theCards), 'passbox-data.json')
    } catch (_) {
      this.sb.open({ msg: 'export data failed' })
    }
  }

  private async exportDataHtml() {
    const templateFn = (str: string) => `
    <!DOCTYPE NETSCAPE-Bookmark-file-1>
    <!-- This is an automatically generated file.
          It will be read and overwritten.
          DO NOT EDIT! -->
    <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'none'; img-src data: *; object-src 'none'"></meta>
    <TITLE>Bookmarks</TITLE>
    <H1>passbox</H1>
    <DL><p>
      <DT><H3>passbox</H3>
        <DL><p>
        ${str}
      </DL><p>
    </DL>`
    try {
      const theCards: CardState = await this.dbService.getItem(StorageKey.cards)
      let str = ''
      theCards.items.forEach(card => {
        if (card.title && card.url) {
          str += `<DT><A HREF="${card.url}">${card.title}</A>\n`
        }
      })
      this.downloadByData(templateFn(str), 'passbox-bookmarks.html')
    } catch (_) {
      this.sb.open({ msg: 'export data failed' })
    }
  }

  private async exportEncryptedData() {
    try {
      const theCardsStr: string = await this.electronService.storageGet(StorageKey.cards)
      const userStateStr: string = await this.electronService.storageGet(
        StorageKey.userState,
      )
      const data: {
        [StorageKey.cards]: CardState
        [StorageKey.userState]: UserState
      } = {
        cards: JSON.parse(theCardsStr),
        userState: JSON.parse(userStateStr),
      }
      this.downloadByData(JSON.stringify(data), 'passbox-data.json')
    } catch (_) {
      this.sb.open({ msg: 'export data failed' })
    }
  }

  importData(event: Event): void {
    event.stopPropagation()
    this.electronService.remote.dialog
      .showOpenDialog(this.electronService.remote.BrowserWindow.getFocusedWindow(), {
        title: 'import data',
        filters: [
          {
            name: 'passbox',
            extensions: ['json', 'html'],
          },
        ],
        properties: ['openFile'],
      })
      .then(async result => {
        if (result.filePaths && result.filePaths.length) {
          const filePath = result.filePaths[0]
          const data = await this.electronService.readFile(filePath)
          const { toString } = Object.prototype
          const ext = filePath.split('.').pop()
          try {
            if (ext !== 'json') {
              const cards = this.html2cards(data)
              if (!cards.length || toString.call(cards[0]) !== '[object Object]') {
                throw new Error('invalid data')
              }
              this.importAddCards(cards, ext)
            } else {
              let jsonData = null
              try {
                jsonData = JSON.parse(data)
              } catch (_) {
                throw new Error('invalid data')
              }
              if (jsonData && jsonData.items && jsonData.items.length) {
                this.importAddCards(jsonData.items, ext)
              } else if (jsonData && jsonData.cards && jsonData.userState) {
                this.json2cards(jsonData)
              } else {
                throw new Error('invalid data')
              }
            }
          } catch (error) {
            this.sb.open({ msg: error.message })
          }
        }
      })
  }

  private json2cards(data: {
    [StorageKey.cards]: CipherString
    [StorageKey.userState]: UserState
  }): void {
    const { isRequiredLogin } = data.userState as UserState
    if (isRequiredLogin) {
      this.sb.open({ msg: 'need password' })
      const dialogRef = this._dialog.open<ImportPasswordDialog>(ImportPasswordDialog, {
        width: 320,
      })
      dialogRef.afterClosed.pipe(filter(result => !!result)).subscribe(async result => {
        let str = ''
        try {
          str = await this.cryptoService.decryptToUtf8WithExternalUserState(
            data.cards,
            data.userState,
            result.password,
          )
        } catch (_) {
          this.sb.open({ msg: 'failed : password error' })
          return
        }
        let res = null
        try {
          res = JSON.parse(str)
        } catch (_) {
          this.sb.open({ msg: 'failed : invalid data' })
        }
        this.importAddCards(res.items, 'json')
      })
    } else {
      try {
        this.cryptoService
          .decryptToUtf8WithExternalUserState(data.cards, data.userState)
          .then(str => {
            let res = null
            try {
              res = JSON.parse(str)
            } catch (_) {
              this.sb.open({ msg: 'failed : invalid data' })
            }
            this.importAddCards(res.items, 'json')
          })
      } catch (_) {
        this.sb.open({ msg: 'failed : password error' })
      }
    }
  }

  private importAddCards(addCards: Card[], from: string): void {
    const cards: Card[] = []
    let existCards: Card[] = []
    const subscriber = this.cards$.subscribe({
      next: c => (existCards = c),
    })
    subscriber.unsubscribe()
    const keys = ['title', 'description', 'secret', 'url']
    addCards.forEach(card => {
      const isAvailable = keys.some(key => card[key])
      const isNotExist = from === 'html' || !existCards.some(c => c.id === card.id)
      if (isNotExist && isAvailable) {
        cards.push(card)
      }
    })
    this.store.dispatch(add({ cards }))
    this.sb.open({ msg: 'import success' })
  }

  private html2cards(html: string): Card[] {
    const cards: Card[] = []
    const placeholder = document.createElement('div')
    placeholder.innerHTML = html
    const atags = placeholder.querySelectorAll('a')
    atags.forEach(atag => {
      const card: Card = {
        id: uuid(),
        title: atag.innerText || '',
        description: '',
        secret: '',
        url: atag.getAttribute('href') || '',
      }
      cards.push(card)
    })
    return cards
  }

  seeAccount(event: Event): void {
    event.stopPropagation()
  }

  viewMenu(card: Card) {
    const menu = new this.electronService.remote.Menu()
    menu.append(
      new this.electronService.remote.MenuItem({
        label: 'open',
        click: () => {
          this.openBrowser(card)
        },
      }),
    )
    menu.append(
      new this.electronService.remote.MenuItem({
        label: 'modify',
        click: () => {
          this.modify(card)
        },
      }),
    )
    menu.append(
      new this.electronService.remote.MenuItem({
        label: 'delete',
        click: () => {
          this.del(card)
        },
      }),
    )
    menu.popup()
  }

  drop(event: CdkDragDrop<Card[]>) {
    const { previousIndex, currentIndex } = event
    let term = ''
    this.searchTerm$.subscribe(t => (term = t)).unsubscribe()
    if (!term) {
      this.store.dispatch(sort({ previousIndex, currentIndex }))
    }
  }

  onSearch(term: string) {
    this.store.dispatch(search({ term }))
  }

  trackByFn(_index: number, item: Card): string {
    return item.id
  }

  private downloadByData(
    data: BlobPart,
    filename: string,
    mime?: string,
    bom?: BlobPart,
  ) {
    const blobData = typeof bom !== 'undefined' ? [bom, data] : [data]
    const blob = new Blob(blobData, { type: mime || 'application/octet-stream' })
    // @ts-ignore
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      // @ts-ignore
      window.navigator.msSaveBlob(blob, filename)
    } else {
      const blobURL = window.URL.createObjectURL(blob)
      const tempLink = document.createElement('a')
      tempLink.style.display = 'none'
      tempLink.href = blobURL
      tempLink.setAttribute('download', filename)
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank')
      }
      document.body.appendChild(tempLink)
      tempLink.click()
      document.body.removeChild(tempLink)
      window.URL.revokeObjectURL(blobURL)
    }
  }
}

/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
add dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
@Component({
  templateUrl: './card-add-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDialog {
  _if: boolean

  constructor(public dialogRef: LyDialogRef, @Inject(LY_DIALOG_DATA) public data: Card) {
    this._if = false
  }
}

/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
show deleted cards dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/

@Component({
  templateUrl: './card-deleted-dialog.html',
  providers: [StyleRenderer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletedCardsDialog {
  // eslint-disable-next-line max-params
  constructor(
    private electronService: ElectronService,
    readonly sRenderer: StyleRenderer,
    public dialogRef: LyDialogRef,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private store: Store<{ theCards: CardState }>,
    @Inject(LY_DIALOG_DATA) public cards: Card[],
  ) {}

  readonly classes = this.sRenderer.renderSheet((_theme: ThemeVariables) => {
    return {
      root: lyl`{
        table {
          width: 100%
          min-width: 300px
          th, td {
            padding: 0 16px
          }
        }
      }`,
    }
  }, 'root')

  columns = [
    {
      columnDef: 'title',
      header: 'title',
      cell: (card: Card) => `${card.title}`,
    },
    {
      columnDef: 'url',
      header: 'url',
      cell: (card: Card) => `${card.url}`,
    },
  ]

  displayedColumns = this.columns.map(c => c.columnDef)

  viewMenu(card: Card) {
    const menu = new this.electronService.remote.Menu()
    menu.append(
      new this.electronService.remote.MenuItem({
        label: 'restore',
        click: () => {
          this.restoreCard(card)
        },
      }),
    )
    menu.append(
      new this.electronService.remote.MenuItem({
        label: 'delete',
        click: () => {
          this.del(card)
        },
      }),
    )

    menu.popup()
  }

  del(card: Card) {
    this.electronService.remote.dialog
      .showMessageBox(this.electronService.remote.BrowserWindow.getFocusedWindow(), {
        type: 'question',
        title: 'confirm',
        message: 'delete card',
        detail: 'are you sure to delete this card?',
        buttons: ['yes', 'cancel'],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      })
      .then(result => {
        if (result.response === 0) {
          this.ngZone.run(() => {
            this.store.dispatch(remove({ card }))
            this.cards = this.cards.filter(c => c.id !== card.id)
            this._cd.detectChanges()
          })
        }
      })
  }

  restoreCard(card: Card) {
    this.ngZone.run(() => {
      this.store.dispatch(restore({ card }))
      this.cards = this.cards.filter(c => c.id !== card.id)
      this._cd.detectChanges()
    })
  }
}
