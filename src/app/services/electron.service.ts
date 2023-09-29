import { Injectable } from '@angular/core'
import type { Card } from '../models'
import type { StorageKey } from '../enums/storageKey'

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private ipcRenderer = window.electronAPI.ipcRenderer

  constructor() {}

  async getAppInfo(): Promise<{ name: string; version: string }> {
    const result = await this.ipcRenderer.invoke('get-app-info')
    return result
  }

  async getUserDataPath(): Promise<string> {
    const result = await this.ipcRenderer.invoke('get-user-data-path')
    return result
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
}
