import { Injectable } from '@angular/core'
import { StorageKey } from 'src/app/enums'
import type { Card } from '../models'

type AppInfo = {
  name: string
  version: string
}

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private ipcRenderer = window.electronAPI.ipcRenderer
  private appInfo: AppInfo
  private userDataPath: string

  constructor() {}

  async getAppInfo(): Promise<AppInfo> {
    this.appInfo ??= await this.ipcRenderer.invoke('get-app-info')
    return this.appInfo
  }

  // return like: xxx/passbox.json
  async getUserDataPath(): Promise<string> {
    this.userDataPath ??= await this.ipcRenderer.invoke('get-user-data-path')
    return this.userDataPath
  }

  openDevTools() {
    this.ipcRenderer.send('open-dev-tools')
  }

  writeFile(path: string, data: string) {
    this.ipcRenderer.send('write-file', path, data)
  }

  deleteFile(path: string) {
    this.ipcRenderer.send('delete-file', path)
  }

  async readFile(path: string): Promise<string> {
    const result = await this.ipcRenderer.invoke('read-file', path)
    return result
  }

  copyText(text: string) {
    this.ipcRenderer.send('clipboard-write-text', text)
  }

  openBrowser(card: Card) {
    this.ipcRenderer.send('open-browser', card)
  }

  changeTray(cards: Card[]) {
    this.ipcRenderer.send('change-tray', cards)
  }

  cardsStorageSave(
    key: StorageKey,
    value: string,
    needRecordVersions: boolean = false,
  ): Promise<void> {
    return this.ipcRenderer.invoke('cards-save', key, value, needRecordVersions)
  }

  cardsStorageGet(key: StorageKey): Promise<string> {
    return this.ipcRenderer.invoke('cards-get', key)
  }

  cardsStorageGetHistoryItem(version: string): Promise<string> {
    return this.ipcRenderer.invoke('cards-get-history', version)
  }

  setMainWinAlwaysOnTop(flag: boolean) {
    this.ipcRenderer.send('set-main-win-always-on-top', flag)
  }

  setBrowserWinAlwaysOnTop(flag: boolean) {
    this.ipcRenderer.send('set-browser-win-always-on-top', flag)
  }

  registerGlobalShortcutOpenMainWindow(key: string): Promise<boolean> {
    return this.ipcRenderer.invoke('register-global-shortcut-open-main-window', key)
  }

  closeMainWindow() {
    this.ipcRenderer.send('close-main-window')
  }

  minimizeMainWindow() {
    this.ipcRenderer.send('minimize-main-window')
  }

  maximizeMainWindow() {
    this.ipcRenderer.send('maximize-main-window')
  }
}
