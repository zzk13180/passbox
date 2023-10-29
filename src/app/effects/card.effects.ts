import { Injectable } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { tap, withLatestFrom, debounceTime } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { StorageKey } from 'src/app/enums'
import { CardState } from '../models'
import { DbService } from '../services/db.service'
import { ElectronService } from '../services/electron.service'
import {
  add,
  sort,
  modify,
  remove,
  search,
  restore,
  initCards,
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

  storeTheCards = createEffect(
    () =>
      this.actions$.pipe(
        ofType(add, modify, remove, sort, restore),
        debounceTime(300),
        withLatestFrom(this.store.select('theCards')),
        tap(([_action, theCards]) => this.dbService.setItem(StorageKey.cards, theCards)),
      ),
    { dispatch: false },
  )

  changeTray = createEffect(
    () =>
      this.actions$.pipe(
        ofType(initCards, search, add, modify, remove, sort, restore),
        debounceTime(300),
        withLatestFrom(this.store.select(selectCards)),
        tap(([_action, cards]) => this.electronService.changeTray(cards)),
      ),
    { dispatch: false },
  )
}
