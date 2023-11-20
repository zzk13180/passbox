import { CommandEnum } from 'src/app/enums'
import type { KeyboardShortcutsBindingItem } from 'src/app/models'

const isWindows = window.electronAPI.process.platform === 'win32'

export const keyboardShortcutsBindings: KeyboardShortcutsBindingItem[] = [
  {
    label: 'Open add card dialog',
    key: isWindows ? 'CTRL + D' : 'CMD + [KeyD]',
    command: CommandEnum.OpenCardAddDialog,
  },
  {
    label: 'Open password generator',
    key: isWindows ? 'CTRL + G' : 'CMD + [KeyG]',
    command: CommandEnum.OpenPasswordGeneratorDialog,
  },
  {
    label: 'Focus search input',
    key: isWindows ? 'CTRL + F' : 'CMD + [KeyF]',
    command: CommandEnum.FocusSearchInput,
  },
  {
    label: 'Open main window',
    key: '',
    command: CommandEnum.OpenMainWindow,
  },
  {
    label: 'Open apps nav dialog',
    key: '',
    command: CommandEnum.OpenAppsNavDialog,
  },
  {
    label: 'Open settings dialog',
    key: '',
    command: CommandEnum.OpenSettingsDialog,
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
  {
    label: 'Open tutorial dialog',
    key: '',
    command: CommandEnum.OpenTutorialDialog,
  },
  {
    label: 'Close main window',
    key: '',
    command: CommandEnum.CloseMainWindow,
  },
  {
    label: 'Minimize main window',
    key: '',
    command: CommandEnum.MinimizeMainWindow,
  },
  {
    label: 'Maximize main window',
    key: '',
    command: CommandEnum.MaximizeMainWindow,
  },
]
