import { I18nLanguageEnum, CommandEnum } from '../enums'

export interface KeyboardShortcutsBindingItem {
  cmd: CommandEnum
  key?: string
}

export interface SettingsState {
  isFirstTimeLogin: boolean // keep the initial value as false
  currentLang: I18nLanguageEnum
  KeyboardShortcutsBindings: KeyboardShortcutsBindingItem[]
}
