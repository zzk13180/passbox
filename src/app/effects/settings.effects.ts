import { Injectable, Inject } from '@angular/core'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import {
  tap,
  withLatestFrom,
  debounceTime,
  from,
  exhaustMap,
  catchError,
  map,
} from 'rxjs'
import { Store } from '@ngrx/store'
import { StorageKey } from 'src/app/enums'
import {
  LocalStorage,
  ElectronService,
  getSettings,
  initSettings,
  resetSettings,
  updateIsFirstTimeLogin,
  updateMainWinAlwaysOnTop,
  updateBrowserWinAlwaysOnTop,
  updateNeedRecordVersions,
  updateCurrentLang,
} from 'src/app/services'
import type { SettingsState } from '../models'

@Injectable()
export class Settingsffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ theSettings: SettingsState }>,
    @Inject(LocalStorage) private storage: Storage,
    private electronService: ElectronService,
  ) {}

  getSettingsFromDB = createEffect(() =>
    this.actions$.pipe(
      ofType(getSettings),
      exhaustMap(() =>
        from([JSON.parse(this.storage.getItem(StorageKey.userSettings) || 'null')]).pipe(
          map(settings => {
            console.log('settings', settings)
            if (!settings) {
              return resetSettings()
            }
            // if the settings is from db, then we need to update the main process settings
            this.electronService.setMainWinAlwaysOnTop(settings.mainWinAlwaysOnTop)
            this.electronService.setBrowserWinAlwaysOnTop(settings.browserWinAlwaysOnTop)
            return initSettings({ settings })
          }),
          catchError(error => {
            console.error(error)
            return from([resetSettings()])
          }),
        ),
      ),
    ),
  )

  persistSettings = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          resetSettings,
          updateIsFirstTimeLogin,
          updateMainWinAlwaysOnTop,
          updateBrowserWinAlwaysOnTop,
          updateNeedRecordVersions,
          updateCurrentLang,
        ),
        debounceTime(300),
        withLatestFrom(this.store.select('theSettings')),
        tap(([_action, theSettings]) =>
          this.storage.setItem(StorageKey.userSettings, JSON.stringify(theSettings)),
        ),
      ),
    { dispatch: false },
  )

  updateMainWinAlwaysOnTopEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateMainWinAlwaysOnTop),
        tap(action => {
          const { mainWinAlwaysOnTop } = action
          this.electronService.setMainWinAlwaysOnTop(mainWinAlwaysOnTop)
        }),
      ),
    { dispatch: false },
  )

  updateBrowserWinAlwaysOnTopEffect = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateBrowserWinAlwaysOnTop),
        tap(action => {
          const { browserWinAlwaysOnTop } = action
          this.electronService.setBrowserWinAlwaysOnTop(browserWinAlwaysOnTop)
        }),
      ),
    { dispatch: false },
  )
}
