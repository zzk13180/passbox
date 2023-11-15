import { CommandEnum } from 'src/app/enums'
import type { KeyboardShortcutsBindingItem } from '../models'

export const keyboardShortcutsBindings: KeyboardShortcutsBindingItem[] = [
  {
    label: 'Open main window',
    key: 'Ctrl + Alt + A',
    command: CommandEnum.OpenMainWindow,
  },
  {
    label: 'Quit main window',
    key: 'Ctrl + Q',
    command: CommandEnum.QuitMainWindow,
  },
  {
    label: 'Close main window',
    key: 'Ctrl + W',
    command: CommandEnum.CloseMainWindow,
  },
  {
    label: 'Minimize main window',
    key: 'Ctrl + M',
    command: CommandEnum.MinimizeMainWindow,
  },
  {
    label: 'Maximize main window',
    key: 'Ctrl + X',
    command: CommandEnum.MaximizeMainWindow,
  },
  {
    label: 'Open apps nav dialog',
    key: 'Ctrl + A',
    command: CommandEnum.OpenAppsNavDialog,
  },
  {
    label: 'Open settings dialog',
    key: 'Ctrl + S',
    command: CommandEnum.OpenSettingsDialog,
  },
  {
    label: 'Open add card dialog',
    key: 'Ctrl + D',
    command: CommandEnum.OpenCardAddDialog,
  },
  {
    label: 'Open password generator dialog',
    key: 'Ctrl + G',
    command: CommandEnum.OpenPasswordGeneratorDialog,
  },
  {
    label: 'Open password set dialog',
    key: '',
    command: CommandEnum.OpenPasswordSetDialog,
  },
  {
    label: 'Open deleted cards dialog',
    key: '',
    command: CommandEnum.OpenDeletedCardsDialog,
  },
  {
    label: 'Open history dialog',
    key: '',
    command: CommandEnum.OpenHistoryDialog,
  },
  {
    label: 'Open import dialog',
    key: '',
    command: CommandEnum.OpenImportDialog,
  },
  {
    label: 'Open export dialog',
    key: '',
    command: CommandEnum.OpenExportDialog,
  },
  {
    label: 'Open help dialog',
    key: '',
    command: CommandEnum.OpenHelpDialog,
  },
]
