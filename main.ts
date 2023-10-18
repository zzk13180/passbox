import * as path from 'node:path'
import * as cypto from 'node:crypto'
import { parse, URL } from 'node:url'
import * as fs from 'fs-extra'
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

class Main {
  windowMain: WindowMain

  constructor() {
    if (this.isServer) {
      const appDataPath = app.getAppPath()
      app.setPath('userData', `${appDataPath}/${app.name}-user-data`)
      app.setPath('logs', path.join(app.getPath('userData'), 'logs'))
    }
    if (process.platform !== 'darwin') {
      Menu.setApplicationMenu(null)
    }
    this.windowMain = new WindowMain(this.isServer)
  }

  get isServer(): boolean {
    const args = process.argv.slice(1)
    return args.some(val => val === '--serve')
  }

  bootstrap() {
    this.windowMain.init()
    if (this.isServer) {
      this.windowMain.win.webContents.openDevTools()
      this.windowMain.win.loadURL('http://localhost:4200')
    } else {
      this.windowMain.win.loadURL(`file://${path.join(__dirname, 'dist/index.html')}`)
    }
  }
}

class WindowMain {
  win: BrowserWindow
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
  ) {}

  init() {
    this.createWindow()
    this.enableTray()
  }

  private createWindow(): void {
    this.win = new BrowserWindow({
      show: false,
      width: 430,
      height: 500,
      icon: path.join(
        __dirname,
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        enableWebSQL: false,
        spellcheck: false,
        preload: path.join(
          __dirname,
          `${this.isServe ? 'src' : 'dist'}/preload/preload.js`,
        ),
      },
    })

    this.win.once('ready-to-show', () => {
      this.win.show()
    })

    this.win.on('closed', () => {
      this.win.destroy()
    })

    this.win.on('close', (e: Event) => {
      if (!this.isQuitting) {
        e.preventDefault()
        if (this.win) {
          this.win.hide()
        }
        if (process.platform === 'darwin') {
          app.dock.hide()
        }
      }
    })

    ipcMain.handle('get-user-data-path', (): string => {
      return this.store.path ?? ''
    })

    ipcMain.on('change-tray', (_, cards: Array<Card> = []) => {
      const menuItems: MenuItemConstructorOptions[] = []
      // TODO : If lot of cards, tray menu will be slow. so set max menuItems length 999.
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
      this.win.webContents.openDevTools()
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
    const win = new BrowserWindow({
      width: card.width,
      height: card.height,
      title: url,
      icon: path.join(
        __dirname,
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
    })
    const menuTemplate = new BrowserMenu(win).init()
    contextMenu({
      prepend: () => menuTemplate,
      window: win,
    })
    if (process.platform !== 'darwin') {
      win.setMenu(Menu.buildFromTemplate(menuTemplate))
      win.setMenuBarVisibility(false)
    }
    win.on('closed', () => win.destroy())
    win.loadURL(url)
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
          `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.24x24.png`,
        ),
      )
      this.tray.setPressedImage(
        path.join(
          __dirname,
          `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.24x24.png`,
        ),
      )
    } else {
      this.tray = new Tray(
        path.join(__dirname, `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.png`),
      )
    }
    this.tray.setToolTip(app.name)
    this.changeTrayMenu()
    if (process.platform !== 'darwin') {
      const toggleWindow = () => {
        if (this.win) {
          this.win.show()
          this.win.focus()
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
          if (this.win) {
            this.win.hide()
            this.win.destroy()
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
          if (this.win) {
            this.win.show()
            this.win.focus()
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
}

class BrowserMenu {
  constructor(private win: BrowserWindow) {}
  private isOSX(): boolean {
    return process.platform === 'darwin'
  }

  private zoomOut(): void {
    this.win.webContents.zoomFactor -= 0.1
  }

  private zoomIn(): void {
    this.win.webContents.zoomFactor += 0.1
  }

  private zoomReset(): void {
    this.win.webContents.zoomFactor = 1.0
  }

  private goBack(): void {
    this.win.webContents.goBack()
  }

  private goForward(): void {
    this.win.webContents.goForward()
  }

  init(): MenuItemConstructorOptions[] {
    const viewMenu: MenuItemConstructorOptions = {
      label: '&View',
      submenu: [
        {
          label: 'Back',
          accelerator: this.isOSX() ? 'Cmd+Left' : 'Alt+Left',
          click: (): void => this.goBack(),
        },
        {
          label: 'Forward',
          accelerator: this.isOSX() ? 'Cmd+Right' : 'Alt+Right',
          click: (): void => this.goForward(),
        },
        {
          label: 'Reload',
          role: 'reload',
        },
        {
          type: 'separator',
        },
        {
          label: 'Toggle Full Screen',
          accelerator: this.isOSX() ? 'Ctrl+Cmd+F' : 'F11',
          enabled: this.win.isFullScreenable() || this.isOSX(),
          visible: this.win.isFullScreenable() || this.isOSX(),
          click: (): void => {
            if (this.win.isFullScreenable()) {
              this.win.setFullScreen(!this.win.isFullScreen())
            } else if (this.isOSX()) {
              this.win.setSimpleFullScreen(!this.win.isSimpleFullScreen())
            }
          },
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+=',
          click: (): void => this.zoomIn(),
        },
        {
          label: 'ZoomInAdditionalShortcut',
          visible: false,
          acceleratorWorksWhenHidden: true,
          accelerator: 'CmdOrCtrl+numadd',
          click: (): void => this.zoomIn(),
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: (): void => this.zoomOut(),
        },
        {
          label: 'ZoomOutAdditionalShortcut',
          visible: false,
          acceleratorWorksWhenHidden: true,
          accelerator: 'CmdOrCtrl+numsub',
          click: (): void => this.zoomOut(),
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: (): void => this.zoomReset(),
        },
        {
          label: 'ZoomResetAdditionalShortcut',
          visible: false,
          acceleratorWorksWhenHidden: true,
          accelerator: 'CmdOrCtrl+num0',
          click: (): void => this.zoomReset(),
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: this.isOSX() ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => this.win.webContents.toggleDevTools(),
        },
        {
          label: 'Undo',
          visible: false,
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          label: 'Redo',
          visible: false,
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
        },
        {
          label: 'Cut',
          visible: false,
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          label: 'Copy',
          visible: false,
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          visible: false,
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          label: 'Select All',
          visible: false,
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll',
        },
      ],
    }
    const closeWindow: MenuItemConstructorOptions = {
      label: 'Close Window',
      accelerator: 'CmdOrCtrl+W',
      role: 'close',
    }
    const minWindow: MenuItemConstructorOptions = {
      label: 'Minimize Window',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize',
    }
    const reloadWindow: MenuItemConstructorOptions = {
      label: 'Reload Window',
      accelerator: 'CmdOrCtrl+R',
      role: 'reload',
    }
    const copyUrl: MenuItemConstructorOptions = {
      label: 'Copy Current URL',
      accelerator: 'CmdOrCtrl+L',
      click: (): void => clipboard.writeText(this.win.webContents.getURL()),
    }
    const templates = [closeWindow, minWindow, reloadWindow, copyUrl, viewMenu]
    return templates
  }
}

const main = new Main()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' || main.windowMain.isQuitting) {
    app.quit()
    app.exit(0)
  }
})

app.on('before-quit', () => {
  main.windowMain.isQuitting = true
})

app.on('ready', () => {
  main.bootstrap()
})

app.on('activate', (_e, hasVisibleWindows: boolean) => {
  if (!main.windowMain.win) {
    main.bootstrap()
  } else if (process.platform === 'darwin' && !hasVisibleWindows) {
    main.windowMain.win.show()
    app.dock.show()
  }
})

if (!app.requestSingleInstanceLock()) {
  app.quit()
  app.exit(0)
} else {
  app.on('second-instance', () => {
    const { win } = main.windowMain
    if (win) {
      if (!win.isVisible()) {
        win.show()
      }
      if (win.isMinimized()) {
        win.restore()
      }
      win.once('ready-to-show', () => {
        win.show()
      })
      win.focus()
    }
  })
}
