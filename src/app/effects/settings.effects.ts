import { Injectable, Inject } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { tap, withLatestFrom, debounceTime } from 'rxjs'
import { Store } from '@ngrx/store'
import { StorageKey } from 'src/app/enums'
import {
  LocalStorage,
  updateLanguage,
  getSettings,
  // initSettings,
  // resetSettings,
} from 'src/app/services'
import type { SettingsState } from '../models'

@Injectable()
export class Settingsffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ theSettings: SettingsState }>,
    @Inject(LocalStorage) private storage: Storage,
  ) {}

  getSettingsFromDB = createEffect(
    () =>
      this.actions$.pipe(
        ofType(getSettings),
        tap(() => {
          // try {
          //   const settings = JSON.parse(this.storage.getItem(StorageKey.userSettings))
          //   console.log('Settingsffects getSettingsFromDB settings', settings)
          //   return initSettings({ settings })
          // } catch (error) {
          //   console.error(error)
          //   return resetSettings()
          // }
        }),
      ),
    { dispatch: false },
  )

  // resetSettings = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(resetSettings),
  //     tap(() => {
  //       const settings = {
  //         isFirstTimeLogin: false,
  //         currentLang: I18nLanguageEnum.English,
  //         KeyboardShortcutsBindings: [],
  //       }
  //       this.storage.setItem(
  //         StorageKey.userSettings,
  //         JSON.stringify(settings, null, '\t'),
  //       )
  //       return initSettings({ settings })
  //     }),
  //   ),
  // )

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
