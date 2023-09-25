import { InjectionToken, StaticProvider } from '@angular/core'

export const WindowToken = new InjectionToken<Window>('Window')
export function windowProvider() {
  return window
}

export const LocalStorage = new InjectionToken<Storage>('LocalStorage')
export const SessionStorage = new InjectionToken<Storage>('SessionStorage')

export const STORAGE_PROVIDERS: StaticProvider[] = [
  {
    provide: LocalStorage,
    useFactory: (win: Window) => getStorage(win, 'localStorage'),
    deps: [WindowToken],
  },
  {
    provide: SessionStorage,
    useFactory: (win: Window) => getStorage(win, 'sessionStorage'),
    deps: [WindowToken],
  },
]

function getStorage(
  win: Window,
  storageType: 'localStorage' | 'sessionStorage',
): Storage {
  return win[storageType]
}
