import { Inject, Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { LocalStorage } from '../services'

export enum I18nLanguageEnum {
  English = 'en',
  Chinese = 'zh',
  Japanese = 'ja',
  Spanish = 'es',
  German = 'de',
  Russian = 'ru',
  French = 'fr',
  Italian = 'it',
  Portuguese = 'pt',
  Polish = 'pl',
  Arabic = 'ar',
  Farsi = 'fa',
  Indonesian = 'id',
  Dutch = 'nl',
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly LANGUAGE_KEY = 'passbox::language'
  private currentLang: I18nLanguageEnum = I18nLanguageEnum.English
  private i18nSubject = new ReplaySubject<I18nLanguageEnum>(1)

  constructor(@Inject(LocalStorage) private storage: Storage) {
    const lang = this.storage.getItem(this.LANGUAGE_KEY)
    if (Object.values(I18nLanguageEnum).includes(lang as I18nLanguageEnum)) {
      this.currentLang = lang as I18nLanguageEnum
    }
    this.i18nSubject.next(this.currentLang)
  }

  setLanguage(lang: I18nLanguageEnum) {
    this.storage.setItem(this.LANGUAGE_KEY, lang)
    this.currentLang = lang
    this.i18nSubject.next(lang)
  }

  languageChanges(): Observable<I18nLanguageEnum> {
    return this.i18nSubject.asObservable()
  }
}
