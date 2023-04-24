import { Injectable } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { tap, withLatestFrom, debounceTime } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { CardState } from '../models'
import { StorageKey } from '../enums/storageKey'
import { DbService } from '../services/db.service'
import { ElectronService } from '../services/electron.service'
import {
  add,
  sort,
  modify,
  remove,
  search,
  restore,
  selectCards,
} from '../services/ngrx.service'

@Injectable()
export class CardEffects {
  constructor(
    private actions$: Actions,
    private electronService: ElectronService,
    private store: Store<{ theCards: CardState }>,
    private dbService: DbService,
  ) {}

  card = createEffect(
    () =>
      this.actions$.pipe(
        ofType(add, modify, remove, sort, restore),
        debounceTime(300),
        withLatestFrom(this.store.select('theCards')),
        tap(([_action, theCards]) => {
          this.dbService.setItem(StorageKey.cards, theCards)
          this.electronService.changeTray(theCards.items)
        }),
      ),
    { dispatch: false },
  )

  search = createEffect(
    () =>
      this.actions$.pipe(
        ofType(search),
        debounceTime(300),
        withLatestFrom(this.store.select('theCards').pipe(select(selectCards))),
        tap(([_action, cards]) => {
          this.electronService.changeTray(cards)
        }),
      ),
    { dispatch: false },
  )
}
