import { InjectionToken, StaticProvider } from '@angular/core'

export const LocalStorage = new InjectionToken<Storage>('LocalStorage')

export const STORAGE_PROVIDERS: StaticProvider[] = [
  {
    provide: LocalStorage,
    useFactory: () => getStorage(),
  },
]

function getStorage() {
  const { customLocalStorage } = window.electronAPI
  return customLocalStorage
}
