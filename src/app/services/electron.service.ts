import { Injectable } from '@angular/core'
import type { Card } from '../models'
import type { StorageKey } from 'src/app/enums'

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

  storageSave(key: StorageKey, value: string): Promise<void> {
    return this.ipcRenderer.invoke('storage-save', key, value)
  }

  storageGet(key: StorageKey): Promise<string> {
    return this.ipcRenderer.invoke('storage-get', key)
  }

  storageClear(): Promise<void> {
    return this.ipcRenderer.invoke('storage-clear')
  }

  setAlwaysOnTop(flag: boolean) {
    this.ipcRenderer.send('set-always-on-top', flag)
  }
}
