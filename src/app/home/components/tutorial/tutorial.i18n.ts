import { I18nLanguageEnum } from 'src/app/services'

export class I18nText {
  private currentLang: I18nLanguageEnum
  constructor(currentLang: I18nLanguageEnum) {
    this.currentLang = currentLang
  }

  get test() {
    return this.currentLang
  }
}
