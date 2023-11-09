import { I18nLanguageEnum, CommandEnum } from '../enums'

export interface KeyboardShortcutsBindingItem {
  cmd: CommandEnum
  key?: string
}

export interface SettingsState {
  // keep the initial value as false
  isFirstTimeLogin: boolean
  needRecordVersions: boolean
  currentLang: I18nLanguageEnum
  KeyboardShortcutsBindings: KeyboardShortcutsBindingItem[]
}
