/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
show deleted cards dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import {
  Component,
  Inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone,
} from '@angular/core'
import { StyleRenderer, lyl, ThemeVariables } from '@alyle/ui'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { Store } from '@ngrx/store'
import { ElectronService, remove, restore } from '../../../services'
import type { Card, CardState } from '../../../models'

@Component({
  templateUrl: './card-deleted-dialog.html',
  providers: [StyleRenderer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDeletedDialog {
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
