import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  HostListener,
  NgZone,
  OnDestroy,
} from '@angular/core'
import { StyleRenderer, LyTheme2, LyClasses } from '@alyle/ui'
import { LyDialog } from '@alyle/ui/dialog'
import { Observable, filter, take, Subscription, firstValueFrom } from 'rxjs'
import { Store } from '@ngrx/store'
import { StorageKey } from 'src/app/enums'
import {
  ElectronService,
  addInitCards,
  add,
  sort,
  modify,
  deleteCard,
  search,
  getCards,
  selectCards,
  selectDeletedCards,
  selectIsFirstTimeLogin,
  UserStateService,
  updateIsFirstTimeLogin,
  CryptoService,
  MessageService,
} from '../services'
import { downloadByData } from '../utils/download.util'
import { CardAddDialog } from './components/card-add/card-add-dialog.component'
import { CardDeletedDialog } from './components/card-deleted/card-deleted-dialog.component'
import { CardHistoryDialog } from './components/card-history/card-history-dialog.component'
import { ExportSelectDialog } from './components/export/export-select-dialog.component'
import { ImportPasswordDialog } from './components/import/import-password-dialog.component'
import { PasswordSetDialog } from './components/password-set/password-set-dialog.component'
import { LoginDialog } from './components/login/login-dialog.component'
import { AppsDialog } from './components/apps-dialog/apps-dialog.component'
import { HelpDialog } from './components/help/help-dialog.component'
import { PasswordGeneratorDialog } from './components/password-generator/password-generator-dialog.component'
import { TutorialDialog } from './components/tutorial/tutorial.component'
import { SettingsDialog } from './components/settings/settings.component'
import { StepsGuideService, OperateResponse } from './steps-guide'
import { STYLES } from './STYLES.data'
import { steps } from './steps-guide.data'
import { CardsImportService } from './cards-import.service'
import type { Card } from '../models'
import type { CdkDragMove } from '@angular/cdk/drag-drop'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StyleRenderer, CardsImportService],
})
export class HomeComponent implements OnInit, OnDestroy {
  classes: LyClasses<typeof STYLES>
  cards$: Observable<Array<Card>>
  deletedCards$: Observable<Array<Card>>
  readonly itemSize = 54
  private previousIndex = 0
  private distanceY = 0
  private subscriptions = new Subscription()
  // eslint-disable-next-line max-params
  constructor(
    readonly sRenderer: StyleRenderer,
    private _theme: LyTheme2,
    private electronService: ElectronService,
    private _dialog: LyDialog,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private store: Store,
    private userStateService: UserStateService,
    private stepService: StepsGuideService,
    private cardsImportService: CardsImportService,
    private cryptoService: CryptoService,
    private messages: MessageService,
  ) {}

  async ngOnInit() {
    this.classes = this._theme.addStyleSheet(STYLES)
    this.cards$ = this.store.select(selectCards)
    this.deletedCards$ = this.store.select(selectDeletedCards)
    const { isRequiredLogin } = await this.userStateService.getUserState()
    const userPassword = this.userStateService.getUserPassword()
    if (isRequiredLogin && !userPassword) {
      this.showLoginDialog()
    } else {
      this.store.dispatch(getCards())
    }
    this.store.select(selectIsFirstTimeLogin).subscribe(isFirstTimeLogin => {
      if (isFirstTimeLogin) {
        const cards = [
          {
            title: 'Google Translate',
            url: 'https://translate.google.com/',
            description: 'Google Translate',
            secret: '',
            width: 850,
            height: 650,
          },
          {
            title: 'iCloud',
            url: 'https://www.icloud.com/',
            description: 'Apple cloud storage service',
            secret: '',
            width: 850,
            height: 650,
          },
          {
            title: 'Microsoft OneDrive',
            url: 'https://onedrive.live.com/',
            description: "Microsoft's cloud storage service",
            secret: '',
            width: 850,
            height: 650,
          },
          {
            title: 'Google Drive',
            url: 'https://drive.google.com/',
            description: 'Cloud storage service by Google',
            secret: '',
            width: 850,
            height: 650,
          },
          {
            title: 'Amazon S3',
            url: 'https://aws.amazon.com/s3/',
            description: 'Amazon Simple Storage Service',
            secret: '',
            width: 850,
            height: 650,
          },
        ]
        this.showTutorialDialog(true)
        this.store.dispatch(addInitCards({ cards }))
        this.store.dispatch(updateIsFirstTimeLogin({ isFirstTimeLogin: false }))
      }
    })
    this.subscriptions.add(
      this.cardsImportService.inputUserPassword$.subscribe(data => {
        this.ngZone.run(() => {
          const dialogRef = this._dialog.open<ImportPasswordDialog>(
            ImportPasswordDialog,
            {
              width: 320,
            },
          )
          dialogRef.afterClosed.subscribe(result => {
            const { password: userPassword } = result
            this.cardsImportService
              .decryptData2cards({
                ...data,
                userPassword,
              })
              .then(cards => {
                this.dispatchAddCards(cards)
              })
              .catch(err => {
                this.messages.open({ msg: err?.message })
              })
          })
          this._cd.detectChanges()
        })
      }),
    )
  }

  showLoginDialog() {
    const dialogRef = this._dialog.open<LoginDialog>(LoginDialog, {
      width: null,
      height: null,
      maxWidth: null,
      maxHeight: null,
      containerClass: this.classes.dialog,
      disableClose: true,
    })
    dialogRef.afterClosed.subscribe(() => {
      this.store.dispatch(getCards())
    })
  }

  showSetPasswordDialog() {
    const dialogRef = this._dialog.open<PasswordSetDialog>(PasswordSetDialog, {
      width: null,
      height: null,
      maxWidth: null,
      maxHeight: null,
      containerClass: this.classes.dialog,
      disableClose: true,
    })
    dialogRef.afterClosed.subscribe((data?: { hasError: boolean; message: string }) => {
      if (!data) {
        return
      }
      this.messages.open({ msg: data.message })
    })
  }

  onFileDrop(event: { name: string; path: string }) {
    const cards = [
      {
        title: event.name,
        description: '',
        secret: '',
        url: event.path,
        width: 850,
        height: 650,
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
    this.messages.open({
      msg: `${field} is copied`,
    })
  }

  // TODO: settings shortcut key
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
            this.store.dispatch(deleteCard({ card }))
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
        this.messages.open({ msg: 'error: url is empty' })
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
          width: card?.width ?? 850,
          height: card?.height ?? 650,
        },
      })
      .afterClosed.pipe(filter(result => !!result))
      .subscribe(card => {
        let msg = ''
        if (flag === 'add') {
          if (['title', 'description', 'secret', 'url'].some(key => card[key])) {
            this.store.dispatch(add({ cards: [card] }))
            msg = 'add success'
          } else {
            msg = 'error: card is empty'
          }
        }
        if (flag === 'modify') {
          this.store.dispatch(modify({ card }))
          msg = 'modify success'
        }
        this.messages.open({ msg })
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
    event?.stopPropagation()
    const dialogRef = this._dialog.open<ExportSelectDialog>(ExportSelectDialog, {
      width: 320,
    })
    dialogRef.afterClosed.pipe(filter(result => !!result)).subscribe(result => {
      switch (result.option) {
        case 'plain':
          this.exportDataPlain()
          break
        case 'html':
          this.exportDataHtml()
          break
        case 'encrypted':
          this.exportDataEncrypted(result.password)
          break
        default:
          this.exportDataEncrypted(result.password)
          break
      }
    })
  }

  private exportDataPlain() {
    this.cards$.pipe(take(1)).subscribe({
      next: cards => {
        downloadByData(JSON.stringify(cards, null, '\t'), 'passbox-data.json')
      },
      error: err => {
        this.messages.open({ msg: `export data failed : ${err.message}` })
      },
    })
  }

  private exportDataHtml() {
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
    this.cards$.pipe(take(1)).subscribe({
      next: cards => {
        let str = ''
        cards.forEach(card => {
          if (card.title && card.url) {
            str += `<DT><A HREF="${card.url}" data-id="${card.id}" >${card.title}</A>\n`
          }
        })
        downloadByData(templateFn(str), 'passbox-bookmarks.html')
      },
      error: err => {
        this.messages.open({ msg: `export data failed : ${err.message}` })
      },
    })
  }

  private async exportDataEncrypted(password: string) {
    const userPassword = this.userStateService.getUserPassword()
    const userStateStr: string = await this.electronService.cardsStorageGet(
      StorageKey.userState,
    )
    let cards: string
    try {
      if (userPassword === password) {
        cards = await this.electronService.cardsStorageGet(StorageKey.cards)
      } else {
        cards = JSON.stringify(
          await this.cryptoService.encryptWithExternalUserPassword(
            JSON.stringify(await firstValueFrom(this.cards$)),
            password,
          ),
        )
      }
      const data = {
        cards,
        userState: userStateStr,
      }
      downloadByData(JSON.stringify(data), 'passbox-data.json')
    } catch (err) {
      this.messages.open({ msg: `export data failed : ${err.message}` })
    }
  }

  async importData(event: Event) {
    event?.stopPropagation()
    let cards: Card[]
    try {
      cards = await this.cardsImportService.importData()
      this.dispatchAddCards(cards)
    } catch (error) {
      this.messages.open({ msg: error.message })
    }
  }

  private dispatchAddCards(importedCards: Card[]): void {
    this.cards$.pipe(take(1)).subscribe(existsCards => {
      const keys = ['title', 'description', 'secret', 'url']
      const cardsToImport = importedCards
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
      if (!cardsToImport.length) {
        this.messages.open({ msg: 'No data need to be imported' })
      } else {
        this.store.dispatch(add({ cards: cardsToImport }))
        this.messages.open({ msg: `import ${cardsToImport.length} cards success` })
      }
      this._cd.detectChanges()
    })
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

  showHistoryCards() {
    this._dialog.open<CardHistoryDialog>(CardHistoryDialog, {})
  }

  // TODO: settings shortcut key
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
        this.messages.open({ msg: 'copied success' })
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

  openSettingsDialog() {
    const dialogRef = this._dialog.open<SettingsDialog>(SettingsDialog, {
      containerClass: this.classes.settingsDialog,
    })
    dialogRef.afterClosed.subscribe(() => {
      // empty
    })
  }

  ngOnDestroy() {
    this.subscriptions?.unsubscribe()
  }
}
