import { I18nLanguageEnum } from '../enums'

export interface SettingsState {
  isFirstTimeLogin: boolean
  currentLang: I18nLanguageEnum
}
