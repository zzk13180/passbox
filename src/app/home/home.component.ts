import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  HostListener,
  NgZone,
  OnDestroy,
} from '@angular/core'
import { StyleRenderer, LyTheme2, LyClasses } from '@alyle/ui'
import { LyDialog } from '@alyle/ui/dialog'
import { LySnackBar } from '@alyle/ui/snack-bar'
import { Observable, take } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { StorageKey, DBError } from 'src/app/enums'
import { Card, CardState, CipherString } from '../models'
import {
  ElectronService,
  add,
  sort,
  modify,
  remove,
  search,
  initCards,
  selectCards,
  selectDeletedCards,
  UserState,
  UserStateService,
  DbService,
  CryptoService,
} from '../services'

import { downloadByData } from '../utils/download.util'
import { fromB64ToStr } from '../utils/crypto.util'
import { html2cards } from './home.util'
import { CardAddDialog } from './components/card-add/card-add-dialog.component'
import { CardDeletedDialog } from './components/card-deleted/card-deleted-dialog.component'
import { ExportSelectDialog } from './components/export/export-select-dialog.component'
import { ImportPasswordDialog } from './components/import/import-password-dialog.component'
import { PasswordSetDialog } from './components/password/password-set-dialog.component'
import { AppsDialog } from './components/apps-dialog/apps-dialog.component'
import { HelpDialog } from './components/help/help-dialog.component'
import { PasswordGeneratorDialog } from './components/password-generator/password-generator-dialog.component'
import { TutorialDialog } from './components/tutorial/tutorial.component'
import { SettingsDialog } from './components/settings/settings.component'
import { StepsGuideService, OperateResponse } from './steps-guide'
import { STYLES } from './STYLES.data'
import { steps } from './steps-guide.data'

import type { CdkDragMove } from '@angular/cdk/drag-drop'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StyleRenderer],
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('sb') sb: LySnackBar
  classes: LyClasses<typeof STYLES>
  cards$: Observable<Array<Card>>
  deletedCards$: Observable<Array<Card>>
  readonly itemSize = 54
  private previousIndex = 0
  private distanceY = 0
  // eslint-disable-next-line max-params
  constructor(
    readonly sRenderer: StyleRenderer,
    private _theme: LyTheme2,
    private electronService: ElectronService,
    private _dialog: LyDialog,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private store: Store<CardState>,
    private userStateService: UserStateService,
    private dbService: DbService,
    private cryptoService: CryptoService,
    private stepService: StepsGuideService,
  ) {}

  async ngOnInit() {
    this.classes = this._theme.addStyleSheet(STYLES)
    this.cards$ = this.store.select(selectCards)
    this.deletedCards$ = this.store.select(selectDeletedCards)
    const { isRequiredLogin } = await this.userStateService.getUserState()
    const userPassword = this.userStateService.getUserPassword()
    if (isRequiredLogin && !userPassword) {
      this.setPassword(true)
    } else {
      this.initTheCards()
    }
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
            title: 'user data',
            url: await this.electronService.getUserDataPath(),
            description: 'All user data is stored in this file.',
            secret: '',
            width: 800,
            height: 600,
          },
        ]
        this.store.dispatch(add({ cards }))
        this.showTutorialDialog(true)
      }
    }
  }

  setPassword(isLogin?: boolean) {
    const dialogRef = this._dialog.open<PasswordSetDialog, { isLogin: boolean }>(
      PasswordSetDialog,
      {
        width: null,
        height: null,
        maxWidth: null,
        maxHeight: null,
        containerClass: this.classes.dialog,
        data: { isLogin },
        disableClose: true,
      },
    )
    dialogRef.afterClosed.subscribe(result => {
      result && this.initTheCards()
    })
  }

  onFileDrop(event: { name: string; path: string }) {
    const cards = [
      {
        title: event.name,
        description: '',
        secret: '',
        url: event.path,
        width: 800,
        height: 600,
      },
    ]
    this.store.dispatch(add({ cards }))
  }

  eventStop(event: Event) {
    event.stopPropagation()
  }

  copy(card: Card, field: string): void {
    if (!card[field]) {
      return
    }
    this.electronService.copyText(card[field])
    this.sb.open({
      msg: `${field} is copied`,
    })
  }

  @HostListener('window:keydown.meta.d')
  @HostListener('window:keydown.control.d')
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
    const { dialog } = window.electronAPI
    dialog.showMessageBox(
      {
        type: 'question',
        message: 'Delete Card',
        detail: 'Are you sure to delete this card?',
        buttons: ['Cancel', 'Yes'],
        defaultId: 1,
        cancelId: 0,
        noLink: true,
      },
      result => {
        result.response === 1 &&
          this.ngZone.run(() => {
            this.store.dispatch(remove({ card }))
            this._cd.detectChanges()
          })
      },
    )
  }

  openBrowser(card: Card, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    if (!card.url) {
      this.ngZone.run(() => {
        this.sb.open({ msg: 'error: url is empty' })
        this._cd.detectChanges()
      })
      return
    }
    this.electronService.openBrowser(card)
  }

  openDialog(flag: string, card?: Card) {
    this._dialog
      .open<CardAddDialog, Card>(CardAddDialog, {
        data: {
          id: card?.id,
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
          if (this.checkCardIsAvailable(card)) {
            this.store.dispatch(add({ cards: [card] }))
          }
          msg = 'add success'
        }
        if (flag === 'modify') {
          this.store.dispatch(modify({ card }))
          msg = 'modify success'
        }
        this.sb.open({ msg })
        this._cd.markForCheck()
      })
  }

  showDeletedCards() {
    this.deletedCards$.pipe(take(1)).subscribe(data => {
      this._dialog.open<CardDeletedDialog, Card[]>(CardDeletedDialog, {
        data,
      })
    })
  }

  exportData(event: Event): void {
    event.stopPropagation()
    const dialogRef = this._dialog.open<ExportSelectDialog>(ExportSelectDialog, {
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
      downloadByData(JSON.stringify(theCards), 'passbox-data.json')
    } catch (err) {
      this.sb.open({ msg: `export data failed : ${err.message}` })
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
    <TITLE>bookmarks exported from passbox</TITLE>
    <H1>bookmarks exported from passbox.if you want, you can import this bookmark into your browser.</H1>
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
          str += `<DT><A HREF="${card.url}" data-id="${card.id}" >${card.title}</A>\n`
        }
      })
      downloadByData(templateFn(str), 'passbox-bookmarks.html')
    } catch (err) {
      this.sb.open({ msg: `export data failed : ${err.message}` })
    }
  }

  private async exportEncryptedData() {
    try {
      const theCardsStr: string = await this.electronService.storageGet(StorageKey.cards)
      const userStateStr: string = await this.electronService.storageGet(
        StorageKey.userState,
      )
      const data = {
        cards: theCardsStr,
        userState: userStateStr,
      }
      downloadByData(JSON.stringify(data), 'passbox-data.json')
    } catch (err) {
      this.sb.open({ msg: `export data failed : ${err.message}` })
    }
  }

  importData(event: Event): void {
    event.stopPropagation()
    const { dialog } = window.electronAPI
    dialog.showOpenDialog(
      {
        title: 'import data',
        filters: [
          {
            name: 'passbox',
            extensions: ['json', 'html'],
          },
        ],
        properties: ['openFile'],
      },
      async result => {
        const filePath = result.filePaths?.[0]
        if (!filePath) {
          return
        }
        const data = await this.electronService.readFile(filePath)
        const ext = filePath.split('.').pop()
        try {
          if (ext !== 'json') {
            const cards = html2cards(data)
            if (!cards.length || cards[0]?.toString() !== '[object Object]') {
              throw new Error('invalid data')
            }
            this.addImportedCards(cards)
          } else {
            let jsonData = null
            try {
              jsonData = JSON.parse(data)
            } catch (_) {
              throw new Error('invalid data')
            }
            if (jsonData?.items?.length) {
              this.addImportedCards(jsonData.items)
            } else if (jsonData?.cards && jsonData?.userState) {
              this.encryptedData2cards(jsonData)
            } else {
              throw new Error('invalid data')
            }
          }
        } catch (error) {
          this.sb.open({ msg: error.message })
        }
      },
    )
  }

  private encryptedData2cards(data: {
    [StorageKey.cards]: string
    [StorageKey.userState]: string
  }): void {
    let cards: CipherString = null
    let userState: UserState = null
    try {
      cards = JSON.parse(data.cards)
      userState = JSON.parse(fromB64ToStr(data.userState))
    } catch (_) {
      this.sb.open({ msg: 'failed : invalid data' })
      return
    }
    const { isRequiredLogin } = userState as UserState
    if (isRequiredLogin) {
      this.sb.open({ msg: 'need password' })
      const dialogRef = this._dialog.open<ImportPasswordDialog>(ImportPasswordDialog, {
        width: 320,
      })
      dialogRef.afterClosed.pipe(filter(result => !!result)).subscribe(async result => {
        let str = ''
        try {
          str = await this.cryptoService.decryptToUtf8WithExternalUserState(
            cards,
            userState,
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
        this.addImportedCards(res.items)
      })
    } else {
      try {
        this.cryptoService
          .decryptToUtf8WithExternalUserState(cards, userState)
          .then(str => {
            let res = null
            try {
              res = JSON.parse(str)
            } catch (_) {
              this.sb.open({ msg: 'failed : invalid data' })
            }
            this.addImportedCards(res.items)
          })
      } catch (_) {
        this.sb.open({ msg: 'failed : invalid data' })
      }
    }
  }

  private addImportedCards(importedCards: Card[]): void {
    this.cards$.pipe(take(1)).subscribe(cards => {
      const cardsToImport = importedCards.filter(
        card =>
          this.checkCardIsAvailable(card) &&
          !cards.some(
            item =>
              item.id === card.id ||
              (item.url === card.url &&
                item.title === card.title &&
                item.secret === card.secret &&
                item.description === card.description),
          ),
      )
      this.store.dispatch(add({ cards: cardsToImport }))
      this.sb.open({ msg: 'import success' })
      this.ngZone.run(() => {
        this._cd.detectChanges()
      })
    })
  }

  private checkCardIsAvailable(card: Card): boolean {
    const keys = ['title', 'description', 'secret', 'url']
    return keys.some(key => card[key])
  }

  viewMenu(card: Card) {
    const menus = [
      {
        label: 'open',
        cb: () => this.openBrowser(card),
      },
      {
        label: 'modify',
        cb: () => this.modify(card),
      },
      {
        label: 'delete',
        cb: () => this.del(card),
      },
    ]
    const { menu } = window.electronAPI
    menu.popupMenu(menus)
  }

  onSortStarted(index: number) {
    this.previousIndex = index
  }

  onSortMoved(event: CdkDragMove<Card>) {
    this.distanceY = event.distance.y
  }

  onSortEnd() {
    const y = this.distanceY
    const difference: number = Math.round(Math.abs(y) / this.itemSize) * Math.sign(y)
    const currentIndex: number = this.previousIndex + difference
    if (difference !== 0 && currentIndex >= 0) {
      this.store.dispatch(sort({ previousIndex: this.previousIndex, currentIndex }))
    }
  }

  onSearch(term: string) {
    this.store.dispatch(search({ term }))
  }

  trackByFn(_index: number, item: Card): string {
    return item.id
  }

  openAppsDialog() {
    this._dialog.open<AppsDialog>(AppsDialog, {})
  }

  showHelpDialog() {
    this._dialog.open<HelpDialog>(HelpDialog, {})
  }

  @HostListener('window:keydown.meta.g')
  @HostListener('window:keydown.control.g')
  showPasswordGeneratorDialog() {
    const dialogRef = this._dialog.open<PasswordGeneratorDialog>(
      PasswordGeneratorDialog,
      {},
    )
    dialogRef.afterClosed.subscribe(result => {
      if (result) {
        this.electronService.copyText(result)
        this.sb.open({ msg: 'copied success' })
      }
    })
  }

  showTutorialDialog(showGuide?: boolean) {
    const dialogRef = this._dialog.open<TutorialDialog>(TutorialDialog, {
      width: null,
      height: null,
      maxWidth: null,
      maxHeight: null,
      containerClass: this.classes.dialog,
      disableClose: true,
    })
    dialogRef.afterClosed.subscribe(() => {
      if (showGuide) {
        this.stepService.setSteps(steps)
        this.stepService.setCurrentIndex(0)
        this.stepService.showGuide(true)
      }
    })
  }

  stepOperateChange(event: OperateResponse) {
    if (event.clickType === 'close') {
      this.stepService.showGuide(false)
    }
  }

  openSettings() {
    const dialogRef = this._dialog.open<SettingsDialog>(SettingsDialog, {
      containerClass: this.classes.settingsDialog,
    })
    dialogRef.afterClosed.subscribe(() => {
      // empty
    })
  }

  ngOnDestroy() {}
}
