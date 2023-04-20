import { Injectable } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { tap, withLatestFrom } from 'rxjs/operators'
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
  initCards,
  selectCards,
} from '../services/ngrx.service'
import type { Card } from '../models'

@Injectable()
export class CardEffects {
  constructor(
    private actions$: Actions,
    private electronService: ElectronService,
    private store: Store<{ card: CardState }>,
    private dbService: DbService,
  ) {}

  card = createEffect(
    () =>
      this.actions$.pipe(
        ofType(initCards, add, modify, remove, sort),
        withLatestFrom(this.store.select('card').pipe(select(selectCards))),
        tap(([_action, cards]) => {
          this.dbService.setItem(StorageKey.cards, cards).then(cards => {
            this.electronService.changeTray(cards)
          })
        }),
      ),
    { dispatch: false },
  )

  search = createEffect(
    () =>
      this.actions$.pipe(
        ofType(search),
        withLatestFrom(this.store.select('card').pipe(select(selectCards))),
        tap(([_action, cards]) => {
          this.electronService.changeTray(cards)
        }),
      ),
    { dispatch: false },
  )
}
