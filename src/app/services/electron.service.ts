import { Injectable } from '@angular/core'
import type { clipboard, ipcRenderer } from 'electron'
import type { Card } from '../models'
import * as remote from '@electron/remote'

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

  copyText(text: string) {
    this.clipboard.writeText(text)
  }

  openBrowser(card: Card) {
    this.ipcRenderer.send('open-browser', card)
  }

  changeTray(cards: Card[]) {
    this.ipcRenderer.send('change-tray', cards)
  }

  storageSave(key: string, value: string): Promise<any> {
    return this.ipcRenderer.invoke('storage-save', key, value)
  }

  storageGet(key: string): Promise<string> {
    return this.ipcRenderer.invoke('storage-get', key)
  }
}
