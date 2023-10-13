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
import { remove, restore } from '../../../services'
import type { Card, CardState } from '../../../models'

@Component({
  templateUrl: './card-deleted-dialog.html',
  providers: [StyleRenderer],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDeletedDialog {
  // eslint-disable-next-line max-params
  constructor(
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

  viewMenu(card: Card) {
    const menus = [
      {
        label: 'restore',
        cb: () => {
          this.restoreCard(card)
        },
      },
      {
        label: 'delete',
        cb: () => {
          this.del(card)
        },
      },
    ]
    const { menu } = window.electronAPI
    menu.popupMenu(menus)
  }

  del(card: Card) {
    const { dialog } = window.electronAPI
    dialog.showMessageBox(
      {
        type: 'question',
        title: 'confirm',
        message: 'delete card',
        detail: 'are you sure to delete this card?',
        buttons: ['yes', 'cancel'],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      },
      result => {
        result.response === 0 &&
          this.ngZone.run(() => {
            this.store.dispatch(remove({ card }))
            this.cards = this.cards.filter(c => c.id !== card.id)
            this._cd.detectChanges()
          })
      },
    )
  }

  restoreCard(card: Card) {
    this.ngZone.run(() => {
      this.store.dispatch(restore({ card }))
      this.cards = this.cards.filter(c => c.id !== card.id)
      this._cd.detectChanges()
    })
  }
}
