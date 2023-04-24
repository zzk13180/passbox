import {
  Component,
  OnInit,
  Inject,
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
import { StorageKey } from '../../enums/storageKey'
import { Card, CardState, CardFieldMap } from '../../models'
import {
  ElectronService,
  DbService,
  initCards,
  add,
  sort,
  modify,
  remove,
  search,
  restore,
  selectCards,
  selectDeletedCards,
  selectSearchTerm,
} from '../../services'
import { PasswordSet } from './password-set-dialog.component'

const STYLES = (theme: ThemeVariables, ref: ThemeRef) => {
  const expansion = ref.selectorsOf(EXPANSION_STYLES)
  return {
    $name: 'home-panel',
    title: () => lyl`{
      display: block
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
    }`,
    panelafter: () => lyl`{
      &::after {
        transition: border ${theme.animations.durations.entering}ms ${theme.animations.curves.standard}
        content: ''
        position: absolute
        top: 0
        bottom: 0
        ${theme.before}: 0
        border-${theme.before}: 3px solid transparent
      }
    }`,
    accordion: () => {
      return lyl`{
        ${expansion.expanded} {
          ${expansion.panelHeader} {
            height: 64px
          }
          &${expansion.panel} {
            &::after {
              border-${theme.before}: 3px solid ${theme.primary.default}
            }
          }
          ${expansion.panelHeader} ${expansion.panelTitle} {
            color: ${theme.primary.default}
          }
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
    private dbService: DbService,
    private _dialog: LyDialog,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private store: Store<{ theCards: CardState }>,
  ) {}

  ngOnInit() {
    this.classes = this._theme.addStyleSheet(STYLES)
    const theCardsStore = this.store.select('theCards')
    this.cards$ = theCardsStore.pipe(select(selectCards))
    this.deletedCards$ = theCardsStore.pipe(select(selectDeletedCards))
    this.searchTerm$ = theCardsStore.pipe(select(selectSearchTerm))
    this.initTheCards()
  }

  // TODO: refactor this method
  private async initTheCards(): Promise<void> {
    // TODO : check need set password
    // this.setPassword(true)
    let theCards: CardState | null = null
    try {
      theCards = (await this.dbService.getItem(StorageKey.cards)) as CardState
    } catch (_) {}
    if (!theCards) {
      theCards = {
        term: '',
        items: [
          {
            id: uuid(),
            sysname: 'example - bing.com',
            username: 'example',
            password: 'example',
            url: 'https://www.bing.com/',
            width: 800,
            height: 600,
          },
          {
            id: uuid(),
            sysname: 'example - translate.google.com',
            username: 'example',
            password: 'example',
            url: 'https://translate.google.com/',
            width: 1300,
            height: 650,
          },
        ],
        deletedItems: [],
      }
    }
    this.store.dispatch(initCards({ theCards }))
  }

  setPassword(login?: boolean) {
    this._dialog.open<PasswordSet, { login: boolean }>(PasswordSet, {
      width: null,
      height: null,
      maxWidth: null,
      maxHeight: null,
      containerClass: this.classes.dialog,
      data: { login },
    })
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
          sysname: card?.sysname ?? '',
          username: card?.username ?? '',
          password: card?.password ?? '',
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

  async exportData(event: Event): Promise<void> {
    event.stopPropagation()
    try {
      const theCards = await this.dbService.getItem(StorageKey.cards)
      this.downloadByData(JSON.stringify(theCards), 'passbox-data.json')
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
            name: 'passboxdata',
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
          let cards: Card[] | null = null
          const ext = filePath.split('.').pop()
          try {
            if (ext !== 'json') {
              cards = this.html2cards(data)
            } else {
              cards = JSON.parse(data)
            }
            if (!cards.length || toString.call(cards[0]) !== '[object Object]') {
              throw new Error('invalid data')
            }
          } catch (error) {
            this.sb.open({ msg: 'invalid data' })
          }
          if (cards && toString.call(cards) === '[object Array]') {
            try {
              await this.addCards(cards, ext)
            } catch (error) {
              this.sb.open({ msg: 'invalid data' })
            }
            this.sb.open({ msg: 'import success' })
          }
        }
      })
  }

  private addCards(addCards: Card[], from: string): void {
    const cards: Card[] = []
    let existCards: Card[] = []
    const subscriber = this.cards$.subscribe({
      next: c => (existCards = c),
    })
    subscriber.unsubscribe()
    const keys = ['sysname', 'username', 'password', 'url']
    addCards.forEach(card => {
      const isAvailable = keys.some(key => card[key])
      const isNotExist = from === 'html' || !existCards.some(c => c.id === card.id)
      if (isNotExist && isAvailable) {
        cards.push(card)
      }
    })
    this.store.dispatch(add({ cards }))
  }

  private html2cards(html: string): Card[] {
    const cards: Card[] = []
    const placeholder = document.createElement('div')
    placeholder.innerHTML = html
    const atags = placeholder.querySelectorAll('a')
    atags.forEach(atag => {
      const card: Card = {
        id: uuid(),
        sysname: atag.innerText || '',
        username: '',
        password: '',
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
        label: 'add',
        click: () => {
          this.add()
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
    // menu.append(
    //   new this.electronService.remote.MenuItem({
    //     label: 'open',
    //     click: () => {
    //       this.openBrowser(card)
    //     },
    //   }),
    // )
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
      columnDef: 'sysname',
      header: 'name',
      cell: (card: Card) => `${card.sysname}`,
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
