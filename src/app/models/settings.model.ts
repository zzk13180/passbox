import { I18nLanguageEnum, CommandEnum } from '../enums'

export interface KeyboardShortcutsBindingItem {
  cmd: CommandEnum
  key?: string
}

export interface SettingsState {
  // keep the initial value as false
  isFirstTimeLogin: boolean
  // the initial value keep the same as the value in the main process
  mainWinAlwaysOnTop: boolean
  browserWinAlwaysOnTop: boolean
  needRecordVersions: boolean
  currentLang: I18nLanguageEnum
  KeyboardShortcutsBindings: KeyboardShortcutsBindingItem[]
}
