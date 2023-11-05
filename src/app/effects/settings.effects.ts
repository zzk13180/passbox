import { Injectable, Inject } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { tap, withLatestFrom, debounceTime } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import { StorageKey } from 'src/app/enums'
import { LocalStorage, updateLanguage } from 'src/app/services'
import type { SettingsState } from '../models'

@Injectable()
export class Settingsffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ theSettings: SettingsState }>,
    @Inject(LocalStorage) private storage: Storage,
  ) {}

  updateSettings = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateLanguage),
        debounceTime(300),
        withLatestFrom(this.store.select('theSettings')),
        tap(([_action, theSettings]) =>
          this.storage.setItem(
            StorageKey.userSettings,
            JSON.stringify(theSettings, null, '\t'),
          ),
        ),
      ),
    { dispatch: false },
  )
}
