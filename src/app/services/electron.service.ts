import { Injectable } from '@angular/core'
import * as remote from '@electron/remote'
import type { clipboard, ipcRenderer } from 'electron'
import type { Card } from '../models'
import type { StorageKey } from '../enums/storageKey'

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  remote: typeof remote
  private clipboard: typeof clipboard
  private ipcRenderer: typeof ipcRenderer

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type)
  }

  constructor() {
    if (this.isElectron) {
      this.remote = window.require('@electron/remote')
      const electron = window.require('electron')
      this.clipboard = electron.clipboard
      this.ipcRenderer = electron.ipcRenderer
    }
  }

  async readFile(path: string): Promise<string> {
    const result = await this.ipcRenderer.invoke('read-file', path)
    return result
  }

  copyText(text: string) {
    this.clipboard.writeText(text)
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
}
