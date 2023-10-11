import { Inject, Injectable } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs'
import { LocalStorage } from '../services'

export enum I18nLanguageEnum {
  English = 'en', // 英语
  Chinese = 'zh', // 中文
  Japanese = 'ja', // 日语
  Spanish = 'es', // 西班牙语
  German = 'de', // 德语
  Russian = 'ru', // 俄语
  French = 'fr', // 法语
  Italian = 'it', // 意大利语
  Portuguese = 'pt', // 葡萄牙语
  Polish = 'pl', // 波兰语
  Arabic = 'ar', // 阿拉伯语
  Farsi = 'fa', // 波斯语
  Indonesian = 'id', // 印度尼西亚语
  Dutch = 'nl', // 荷兰语
}

export const i18nLanguageIndexMap = {
  [I18nLanguageEnum.English]: 0,
  [I18nLanguageEnum.Chinese]: 1,
  [I18nLanguageEnum.Japanese]: 2,
  [I18nLanguageEnum.Spanish]: 3,
  [I18nLanguageEnum.German]: 4,
  [I18nLanguageEnum.Russian]: 5,
  [I18nLanguageEnum.French]: 6,
  [I18nLanguageEnum.Italian]: 7,
  [I18nLanguageEnum.Portuguese]: 8,
  [I18nLanguageEnum.Polish]: 9,
  [I18nLanguageEnum.Arabic]: 10,
  [I18nLanguageEnum.Farsi]: 11,
  [I18nLanguageEnum.Indonesian]: 12,
  [I18nLanguageEnum.Dutch]: 13,
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
