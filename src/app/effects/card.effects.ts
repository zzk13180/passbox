import { Injectable } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { tap, withLatestFrom } from 'rxjs/operators'
import { Store, select } from '@ngrx/store'
import { CardState } from '../models'
import { DbService } from '../services/db.service'
import { add, modify, remove, selectCards, initCards } from '../services/ngrx.service'
import { ElectronService } from '../services/electron.service'

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
        ofType(initCards, add, modify, remove),
        withLatestFrom(this.store.select('card').pipe(select(selectCards))),
        tap(([action, cards]) => {
          this.dbService.setItem('cards', cards).then(cards => {
            this.electronService.changeTray(cards)
          })
        }),
      ),
    { dispatch: false },
  )
}
