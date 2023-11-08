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
  addInitCards,
  add,
  sort,
  modify,
  deleteCard,
  permanentlyDeleteCard,
  search,
  restore,
  initCards,
  selectCards,
  selectNeedRecordVersions,
  updateIsFirstTimeLogin,
} from '../services'

@Injectable()
export class CardEffects {
  constructor(
    private actions$: Actions,
    private electronService: ElectronService,
    private store: Store<{ theCards: CardState }>,
    private db: CardsDbService,
  ) {}

  getCardsFromDB = createEffect(() =>
    this.actions$.pipe(
      ofType(getCards),
      exhaustMap(() =>
        from(this.db.getCards(StorageKey.cards)).pipe(
          map(theCards => initCards({ theCards })),
          catchError(error => {
            if (error?.message === DBError.noData) {
              return from([updateIsFirstTimeLogin({ isFirstTimeLogin: true })])
            }
            const { dialog } = window.electronAPI
            dialog.showMessageBox(
              {
                type: 'error',
                title: 'Error',
                message: `Get Data Error. ${error.message} Please Feedback or Go back to the previous data version.`,
              },
              () => {},
            )
            return EMPTY
          }),
        ),
      ),
    ),
  )

  storeTheCards = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          addInitCards,
          add,
          modify,
          deleteCard,
          permanentlyDeleteCard,
          sort,
          restore,
        ),
        debounceTime(300),
        withLatestFrom(this.store.select('theCards')),
        withLatestFrom(this.store.select(selectNeedRecordVersions)),
        tap(([[action, theCards], needRecordVersionsSettings]) => {
          let needRecordVersions = false
          if (
            (action.type === add.type ||
              action.type === modify.type ||
              action.type === deleteCard.type ||
              action.type === restore.type) &&
            needRecordVersionsSettings
          ) {
            console.log('action', action)
            console.log('action', needRecordVersionsSettings)

            needRecordVersions = true
          }
          console.log('needRecordVersions', needRecordVersions)
          this.db.setCards(StorageKey.cards, theCards, needRecordVersions)
        }),
      ),
    { dispatch: false },
  )

  changeTray = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          initCards,
          search,
          addInitCards,
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
