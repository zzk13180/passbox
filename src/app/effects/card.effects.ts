import { Injectable } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import {
  catchError,
  exhaustMap,
  tap,
  map,
  from,
  withLatestFrom,
  debounceTime,
  EMPTY,
} from 'rxjs'
import { Store } from '@ngrx/store'
import { StorageKey, DBError } from 'src/app/enums'
import { CardState } from '../models'
import {
  CardsDbService,
  ElectronService,
  getCards,
  add,
  sort,
  modify,
  deleteCard,
  permanentlyDeleteCard,
  search,
  restore,
  initCards,
  selectCards,
  updateIsFirstTimeLogin,
} from '../services'

@Injectable()
export class CardEffects {
  constructor(
    private actions$: Actions,
    private electronService: ElectronService,
    private store: Store<{ theCards: CardState }>,
    private cardsDbService: CardsDbService,
  ) {}

  getCardsFromDB = createEffect(() =>
    this.actions$.pipe(
      ofType(getCards),
      exhaustMap(() =>
        from(this.cardsDbService.getItem(StorageKey.cards)).pipe(
          map(theCards => initCards({ theCards })),
          catchError(error => {
            if (error?.message === DBError.noData) {
              return from([updateIsFirstTimeLogin({ isFirstTimeLogin: true })])
            }
            console.error(error)
            return EMPTY
          }),
        ),
      ),
    ),
  )

  storeTheCards = createEffect(
    () =>
      this.actions$.pipe(
        ofType(add, modify, deleteCard, permanentlyDeleteCard, sort, restore),
        debounceTime(300),
        withLatestFrom(this.store.select('theCards')),
        tap(([_action, theCards]) =>
          this.cardsDbService.setItem(StorageKey.cards, theCards),
        ),
      ),
    { dispatch: false },
  )

  changeTray = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          initCards,
          search,
          add,
          modify,
          deleteCard,
          permanentlyDeleteCard,
          sort,
          restore,
        ),
        debounceTime(300),
        withLatestFrom(this.store.select(selectCards)),
        tap(([_action, cards]) => this.electronService.changeTray(cards)),
      ),
    { dispatch: false },
  )
}
