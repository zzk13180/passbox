import path from 'node:path'
import cypto from 'node:crypto'
import { parse, URL } from 'node:url'
import fs from 'fs-extra'
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

const Store = require('electron-store')
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

  constructor(
    private isServe = false,
    private store = new Store({
      defaults: {},
      name: app.name,
    }),
    private customLocalStorage = new Store({
      defaults: {},
      name: `${app.name}-custom-local-storage`,
    }),
  ) {
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
      dialog.showErrorBox('failed to open the link', `invalid url: ${card.url}`)
      return Promise.resolve(false)
    }
    const browserWindow = new BrowserWindow({
      width: card.width,
      height: card.height,
      title: url,
      icon: path.join(
        __dirname,
        '../',
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
      alwaysOnTop: true,
    })
    const menuTemplate = new OpenBrowserMenu(browserWindow).init()
    contextMenu({
      prepend: () => menuTemplate,
      window: browserWindow,
    })
    if (process.platform !== 'darwin') {
      browserWindow.setMenu(Menu.buildFromTemplate(menuTemplate))
      browserWindow.setMenuBarVisibility(false)
    }
    browserWindow.on('closed', () => browserWindow.destroy())
    browserWindow.loadURL(url)
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
      return this.store.path ?? ''
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
        data = fs.readFileSync(path, 'utf8')
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
      fs.outputFile(pathname, content, options)
        .then(() => {})
        .catch(error => {
          event.reply('write-file-error', error.message)
        })
    })

    ipcMain.on('delete-file', (event, pathname) => {
      fs.remove(pathname)
        .then(() => {})
        .catch(error => {
          event.reply('delete-file-error', error.message)
        })
    })

    ipcMain.on('open-browser', (_, card: Card) => {
      this.openBrowser(card)
    })

    ipcMain.handle('storage-get', (_, key: string): string => {
      return this.store.get(key, '')
    })

    ipcMain.handle('storage-save', (_, key: string, value: string): void => {
      return this.store.set(key, value)
    })

    ipcMain.handle('storage-clear', (_): void => {
      return this.store.clear()
    })

    ipcMain.handle('clipboard-read-text', (): string => {
      return clipboard.readText()
    })

    ipcMain.on('clipboard-write-text', (_, text: string): void => {
      clipboard.writeText(text)
    })

    ipcMain.handle('cypto-random-bytes', (_, length: number): Buffer => {
      return cypto.randomBytes(length)
    })

    ipcMain.handle(
      'crypto-pbkdf2-sync',
      // eslint-disable-next-line max-params
      (_, password, salt, iterations, keylen, digest): Buffer => {
        const nodePassword = Buffer.from(password)
        const nodeSalt = Buffer.from(salt)
        return cypto.pbkdf2Sync(nodePassword, nodeSalt, iterations, keylen, digest)
      },
    )

    ipcMain.handle(
      'crypto-create-decipheriv',
      // eslint-disable-next-line max-params
      (_, algorithm, key, iv, data): Buffer => {
        const nodeKey = Buffer.from(key)
        const nodeIv = Buffer.from(iv)
        const nodeData = Buffer.from(data)
        const decipher = cypto.createDecipheriv(algorithm, nodeKey, nodeIv)
        const decBuf = Buffer.concat([decipher.update(nodeData), decipher.final()])
        return decBuf
      },
    )

    // eslint-disable-next-line max-params
    ipcMain.handle('crypto-create-cipheriv', (_, algorithm, key, iv, data): Buffer => {
      const nodeKey = Buffer.from(key)
      const nodeIv = Buffer.from(iv)
      const nodeData = Buffer.from(data)
      const cipher = cypto.createCipheriv(algorithm, nodeKey, nodeIv)
      const encBuf = Buffer.concat([cipher.update(nodeData), cipher.final()])
      return encBuf
    })

    ipcMain.handle('crypto-random-bytes', (_, length: number): Buffer => {
      return cypto.randomBytes(length)
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
      dialog.showMessageBox(options).then(result => {
        event.reply('show-message-box-reply', eventId, result)
      })
    })

    ipcMain.on('show-open-dialog', (event, options: any, eventId: string) => {
      dialog.showOpenDialog(options).then(result => {
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
  }
}
