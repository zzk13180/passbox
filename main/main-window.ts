import path from 'node:path'
import crypto from 'node:crypto'
import { parse, URL } from 'node:url'
import { readFileSync, unlinkSync, existsSync, mkdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import {
  app,
  Tray,
  Menu,
  MenuItem,
  Event,
  dialog,
  ipcMain,
  clipboard,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron'
import { OpenBrowserMenu } from './open-browser-menu'
import { Store } from './store'
import type { Store as StoreType } from './store'

const contextMenu = require('electron-context-menu')

interface Card {
  id: string
  title: string
  description: string
  url: string
  width?: number
  height?: number
}

export class MainWindow {
  browserWindow: BrowserWindow
  isQuitting = false
  private tray: Tray
  private contextMenu: Menu
  private menuItems: Array<MenuItemConstructorOptions> = []
  private openBrowserWindows: Array<BrowserWindow> = []
  private openBrowserWindowAlwaysOnTop = false
  private cardStorage: StoreType
  private customLocalStorage: StoreType

  constructor(private isServe = false) {
    const userDataPath = app.getPath('userData')
    const cardStoragePath = path.join(userDataPath, `${app.name}.json`)
    const customLocalStoragePath = path.join(userDataPath, 'custom-local-storage.json')
    this.cardStorage = new Store(cardStoragePath)
    this.customLocalStorage = new Store(customLocalStoragePath)
    this.registerIpcMain()
  }

  init() {
    this.createWindow()
    this.enableTray()
    // registerGlobalShortcut
  }

  private createWindow(): void {
    this.browserWindow = new BrowserWindow({
      show: false,
      width: 430,
      height: 500,
      icon: path.join(
        __dirname,
        '../',
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
      alwaysOnTop: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        enableWebSQL: false,
        spellcheck: false,
        preload: path.join(
          __dirname,
          '../',
          `${this.isServe ? 'src' : 'dist'}/preload/preload.js`,
        ),
      },
    })

    this.browserWindow.once('ready-to-show', () => {
      this.browserWindow.show()
    })

    this.browserWindow.on('closed', () => {
      this.browserWindow.destroy()
    })

    this.browserWindow.on('close', (e: Event) => {
      if (!this.isQuitting) {
        e.preventDefault()
        if (this.browserWindow) {
          this.browserWindow.hide()
        }
        if (process.platform === 'darwin') {
          app.dock.hide()
        }
      }
    })
  }

  private openBrowser(card: Card): Promise<boolean> {
    const { href, protocol, pathname } = parse(card.url)
    let url = ''
    if (protocol) {
      url = href
    } else if (pathname) {
      if (!pathname.startsWith('/')) {
        url = `http://${href}`
      } else {
        url = `file://${href}`
      }
      try {
        // eslint-disable-next-line no-new
        new URL(url)
      } catch (_) {
        url = ''
      }
    }
    if (!url) {
      dialog.showMessageBox(this.browserWindow, {
        type: 'error',
        title: 'failed to open the link',
        message: `invalid url: ${card.url}`,
      })
      return Promise.resolve(false)
    }
    const openBrowserWindow = new BrowserWindow({
      width: card.width,
      height: card.height,
      title: url,
      icon: path.join(
        __dirname,
        '../',
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
      alwaysOnTop: this.openBrowserWindowAlwaysOnTop,
    })
    const menuTemplate = new OpenBrowserMenu(openBrowserWindow).init()
    contextMenu({
      prepend: () => menuTemplate,
      window: openBrowserWindow,
    })
    if (process.platform !== 'darwin') {
      openBrowserWindow.setMenu(Menu.buildFromTemplate(menuTemplate))
      openBrowserWindow.setMenuBarVisibility(false)
    }
    openBrowserWindow.on('closed', () => openBrowserWindow.destroy())
    openBrowserWindow.loadURL(url)
    this.openBrowserWindows.push(openBrowserWindow)
    return Promise.resolve(true)
  }

  private enableTray(): void {
    if (this.tray) {
      return
    }
    if (process.platform === 'darwin') {
      this.tray = new Tray(
        path.join(
          __dirname,
          '../',
          `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.24x24.png`,
        ),
      )
      this.tray.setPressedImage(
        path.join(
          __dirname,
          '../',
          `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.24x24.png`,
        ),
      )
    } else {
      this.tray = new Tray(
        path.join(
          __dirname,
          '../',
          `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.png`,
        ),
      )
    }
    this.tray.setToolTip(app.name)
    this.changeTrayMenu()
    if (process.platform !== 'darwin') {
      const toggleWindow = () => {
        if (this.browserWindow) {
          this.browserWindow.show()
          this.browserWindow.focus()
        }
      }
      this.tray.on('click', () => toggleWindow())
      this.tray.on('double-click', () => toggleWindow())
      this.tray.on('right-click', () => {
        this.tray.popUpContextMenu(this.contextMenu)
      })
    }
  }

  private changeTrayMenu(): void {
    const initMenuItemOptions: Array<MenuItemConstructorOptions> = [
      {
        label: 'quit',
        click: () => {
          this.isQuitting = true
          if (this.browserWindow) {
            this.browserWindow.hide()
            this.browserWindow.destroy()
          }
          if (this.tray) {
            this.tray.destroy()
          }
          app.quit()
          app.exit(0)
        },
      },
      { type: 'separator' },
      { type: 'separator' },
    ]
    if (process.platform === 'darwin') {
      initMenuItemOptions.unshift({
        label: 'show',
        click: () => {
          if (this.browserWindow) {
            this.browserWindow.show()
            this.browserWindow.focus()
            app.dock.show()
          }
        },
      })
    }
    const menuItemOptions: Array<MenuItemConstructorOptions> = [
      ...initMenuItemOptions,
      ...this.menuItems,
    ]
    this.contextMenu = Menu.buildFromTemplate(menuItemOptions)
    this.tray.setContextMenu(this.contextMenu)
  }

  private registerIpcMain(): void {
    ipcMain.handle('get-user-data-path', (): string => {
      return this.cardStorage.path ?? ''
    })

    ipcMain.on('change-tray', (_, cards: Array<Card> = []) => {
      const menuItems: MenuItemConstructorOptions[] = []
      for (let i = 0; i < cards.length; i++) {
        if (menuItems.length > 999) {
          break
        }
        const card = cards[i]
        if (card && card.title && card.url) {
          menuItems.push({
            label: card.title,
            click: () => {
              this.openBrowser(card)
            },
          })
        }
      }
      this.menuItems = menuItems
      this.changeTrayMenu()
    })

    ipcMain.handle('read-file', (_, path: string): string => {
      let data = ''
      try {
        data = readFileSync(path, 'utf8')
      } catch (_) {}
      return data
    })

    ipcMain.handle('get-app-info', () => {
      return {
        name: app.name,
        version: app.getVersion(),
      }
    })

    ipcMain.on('open-dev-tools', () => {
      this.browserWindow.webContents.openDevTools()
    })

    ipcMain.on('write-file', (event, pathname, content, options = 'utf-8') => {
      const directoryPath = path.dirname(pathname)
      if (!existsSync(directoryPath)) {
        mkdirSync(directoryPath, { recursive: true })
      }
      writeFile(pathname, content, options)
        .then(() => {})
        .catch(error => {
          event.reply('write-file-error', error.message)
        })
    })

    ipcMain.on('delete-file', (event, pathname) => {
      try {
        unlinkSync(pathname)
      } catch (error) {
        event.reply('delete-file-error', error.message)
      }
    })

    ipcMain.on('open-browser', (_, card: Card) => {
      this.openBrowser(card)
    })

    ipcMain.handle('cards-get', (_, key: string) => {
      return this.cardStorage.get(key)
    })

    ipcMain.handle(
      'cards-save',
      (_, key: string, value: string, needRecordVersions: boolean = false) => {
        this.cardStorage.set(key, value, needRecordVersions)
      },
    )

    ipcMain.handle('cards-clear', _ => {
      this.cardStorage.clear()
    })

    ipcMain.handle('cards-get-history', (_, version: string) => {
      return this.cardStorage.readHistory(version)
    })

    ipcMain.handle('clipboard-read-text', (): string => {
      return clipboard.readText()
    })

    ipcMain.on('clipboard-write-text', (_, text: string): void => {
      clipboard.writeText(text)
    })

    ipcMain.handle(
      'crypto-pbkdf2-sync',
      // eslint-disable-next-line max-params
      (_, password, salt, iterations, keylen, digest): Buffer => {
        const nodePassword = Buffer.from(password)
        const nodeSalt = Buffer.from(salt)
        return crypto.pbkdf2Sync(nodePassword, nodeSalt, iterations, keylen, digest)
      },
    )

    ipcMain.handle(
      'crypto-create-decipheriv',
      // eslint-disable-next-line max-params
      (_, algorithm, key, iv, data): Buffer => {
        const nodeKey = Buffer.from(key)
        const nodeIv = Buffer.from(iv)
        const nodeData = Buffer.from(data)
        const decipher = crypto.createDecipheriv(algorithm, nodeKey, nodeIv)
        const decBuf = Buffer.concat([decipher.update(nodeData), decipher.final()])
        return decBuf
      },
    )

    // eslint-disable-next-line max-params
    ipcMain.handle('crypto-create-cipheriv', (_, algorithm, key, iv, data): Buffer => {
      const nodeKey = Buffer.from(key)
      const nodeIv = Buffer.from(iv)
      const nodeData = Buffer.from(data)
      const cipher = crypto.createCipheriv(algorithm, nodeKey, nodeIv)
      const encBuf = Buffer.concat([cipher.update(nodeData), cipher.final()])
      return encBuf
    })

    ipcMain.on('popup-menu', (event, menus: { label: string; eventId: string }[]) => {
      const menu = new Menu()
      for (let i = 0; i < menus.length; i++) {
        const { label, eventId } = menus[i]
        const menuItem = {
          label,
          click: () => {
            event.reply('popup-menu-click', eventId)
          },
        }
        menu.append(new MenuItem(menuItem))
      }
      menu.once('menu-will-close', () => {
        setTimeout(() => {
          event.reply(
            'popup-menu-close',
            menus.map(menu => menu.eventId),
          )
        }, 500)
      })
      menu.popup()
    })

    ipcMain.on('show-message-box', (event, options: any, eventId: string) => {
      dialog.showMessageBox(this.browserWindow, options).then(result => {
        event.reply('show-message-box-reply', eventId, result)
      })
    })

    ipcMain.on('show-open-dialog', (event, options: any, eventId: string) => {
      dialog.showOpenDialog(this.browserWindow, options).then(result => {
        event.reply('show-open-dialog-reply', eventId, result)
      })
    })

    ipcMain.on('custom-local-storage-set-item', (event, key: string, value: any) => {
      this.customLocalStorage.set(key, value)
    })

    ipcMain.on('custom-local-storage-get-item', (event, key: string) => {
      event.returnValue = this.customLocalStorage.get(key)
    })

    ipcMain.on('custom-local-storage-remove-item', (event, key: string) => {
      this.customLocalStorage.delete(key)
    })

    ipcMain.on('custom-local-storage-clear', () => {
      this.customLocalStorage.clear()
    })

    ipcMain.on('set-always-on-top', (event, flag: boolean) => {
      this.browserWindow.setAlwaysOnTop(flag)
    })

    ipcMain.on('set-always-on-top-open', (event, flag: boolean) => {
      this.openBrowserWindowAlwaysOnTop = flag
      this.openBrowserWindows.forEach(window => {
        window.setAlwaysOnTop(flag)
      })
    })
  }
}
