import {
  Component,
  OnInit,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  NgZone,
} from '@angular/core'
import { StyleRenderer, ThemeVariables, LyTheme2, ThemeRef, lyl } from '@alyle/ui'
import { LyDialog, LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { STYLES as EXPANSION_STYLES } from '@alyle/ui/expansion'
import { LySnackBar } from '@alyle/ui/snack-bar'
import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { Card, CardState, CardFieldMap } from '../../models'
import {
  ElectronService,
  DbService,
  initCards,
  add,
  modify,
  remove,
  selectCards,
  togglePasswordSee,
  togglePanelOpened,
} from '../../services'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StyleRenderer],
})
export class HomeComponent implements OnInit {
  @ViewChild('sb') sb: LySnackBar

  readonly classes = this._theme.addStyleSheet(this.getStyle())
  cards$: Observable<Array<Card>>

  // eslint-disable-next-line max-params
  constructor(
    readonly sRenderer: StyleRenderer,
    private electronService: ElectronService,
    private dbService: DbService,
    private _dialog: LyDialog,
    private _theme: LyTheme2,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private store: Store<{ card: CardState }>,
  ) {}

  ngOnInit(): void {
    this.cards$ = this.store.select('card').pipe(select(selectCards))
    this.dbService.getItem('cards').then(result => {
      const cards: Card[] =
        result && result.length
          ? result
          : [
              {
                id: '0',
                sysname: '必应搜索 bing.com',
                username: 'example',
                password: 'example',
                deleted: false,
                url: 'https://www.bing.com/',
              },
              {
                id: '1',
                sysname: 'https://translate.google.com/',
                username: 'example',
                password: 'example',
                deleted: false,
                url: 'https://translate.google.com/',
                width: 1300,
                height: 650,
              },
            ]
      this.store.dispatch(initCards({ cards }))
    })
  }

  copy(card: Card, field: string): void {
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
    if(!card.url || card.url.indexOf('.') === -1) {
       this.sb.open({msg: 'invalid url'})
       return
    }
    let url = undefined

    if (card.url.startsWith('http')) {
      try {
        url = new URL(card.url).href
      } catch (error) {}
    } else {
      try {
        url = new URL(`https://${card.url}`).href
      } catch (error) {}
    }

    if (url) {
      this.electronService.openBrowser({...card, url})
    } else {
      this.sb.open({msg: 'invalid url'})
    }
  }

  openDialog(flag: string, card?: Card) {
    this._dialog
      .open<AddDialog, Card>(AddDialog, {
        width: 300,
        data: {
          id: card ? card.id : null,
          sysname: card ? card.sysname : '',
          username: card ? card.username : '',
          password: card ? card.password : '',
          url: card ? card.url : '',
          width: card ? card.width : '',
          height: card ? card.height : '',
          deleted: false,
        },
      })
      .afterClosed.pipe(filter(result => !!result))
      .subscribe(card => {
        let msg = ''
        if (flag === 'add') {
          this.store.dispatch(add({ card }))
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

  export(event: Event): void {
    event.stopPropagation()
    this.dbService.getItem('cards').then(cards => {
      this.downloadByData(JSON.stringify(cards), 'user-data.json')
    })
  }

  seeAccount(event: Event): void {
    event.stopPropagation()
  }

  togglePanelOpened(card: Card): void {
    this.store.dispatch(togglePanelOpened({ card }))
  }

  togglePasswordSee(event: Event, card: Card): void {
    event.stopPropagation()
    this.store.dispatch(togglePasswordSee({ card }))
  }

  getPasswordOffStr(card: Card): string {
    const len =
      card.password && card.password.length && card.password.length > 5
        ? card.password.length
        : 6
    return new Array(len + 1).join('*')
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
    menu.popup()
  }

  private getStyle() {
    return (theme: ThemeVariables, ref: ThemeRef) => {
      const expansion = ref.selectorsOf(EXPANSION_STYLES)
      const { before } = theme
      return {
        expansion: () => lyl`{
          ${expansion.panel} {
            &::after {
              transition: border ${theme.animations.durations.entering}ms ${theme.animations.curves.standard}
              content: ''
              position: absolute
              top: 0
              bottom: 0
              ${before}: 0
              border-${before}: 2px solid transparent
            }
          }
          ${expansion.panelHeader} {
            height: 54px
          }
          ${expansion.panelTitle} {
            font-weight: 500
          }
          ${expansion.expanded} {
            ${expansion.panelHeader} {
              height: 64px
            }
            &${expansion.panel} {
              background: ${theme.background.secondary}
              &::after {
                border-${before}: 2px solid ${theme.primary.default}
              }
            }
            ${expansion.panelHeader} ${expansion.panelTitle} {
              color: ${theme.primary.default}
            }
          }
        }`,
      }
    }
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
