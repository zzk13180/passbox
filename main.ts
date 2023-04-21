import * as path from 'node:path'
import * as fs from 'node:fs'
import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  MenuItemConstructorOptions,
  ipcMain,
} from 'electron'

const Store = require('electron-store')
const remote = require('@electron/remote/main')

interface Card {
  id: string
  sysname: string
  username: string
  password: string
  url: string
  width?: number // BrowserWindow width
  height?: number // BrowserWindow height
}

class Main {
  private windowMain: WindowMain

  constructor() {
    remote.initialize()
    if (this.isServer) {
      const appDataPath = app.getAppPath()
      app.setPath('userData', `${appDataPath}/passbox-user-data`)
      app.setPath('logs', path.join(app.getPath('userData'), 'logs'))
    }
    this.windowMain = new WindowMain(this.isServer)
  }

  get isServer(): boolean {
    const args = process.argv.slice(1)
    return args.some(val => val === '--serve')
  }

  bootstrap() {
    this.windowMain.init().then(
      () => {
        if (this.isServer) {
          this.windowMain.win.webContents.openDevTools()
          this.windowMain.win.loadURL('http://localhost:4200')
        } else {
          // this.windowMain.win.webContents.openDevTools()
          this.windowMain.win.loadURL(`file://${path.join(__dirname, 'dist/index.html')}`)
        }
      },
      err => console.error(err),
    )
  }
}

class WindowMain {
  win: BrowserWindow
  isQuitting = false
  tray: Tray
  contextMenu: Menu
  menuItems: Array<MenuItemConstructorOptions> = []
  cards: Array<Card> = []
  store: typeof Store

  constructor(
    private isServe = false,
    private defaultWidth = 430,
    private defaultHeight = 500,
  ) {
    this.store = new Store({
      defaults: {},
      name: 'user-data',
    })
  }

  init(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (!app.requestSingleInstanceLock()) {
          app.quit()
          app.exit(0)
        }

        app.on('second-instance', () => {
          if (this.win) {
            this.win.focus()
            if (this.win.isMinimized() || !this.win.isVisible()) {
              this.win.restore()
            }
            this.win.once('ready-to-show', () => {
              this.win.show()
            })
          }
        })

        app.on('ready', async () => {
          await this.createWindow()
          await this.enableTray()
          resolve(true)
        })

        app.on('window-all-closed', () => {
          if (process.platform !== 'darwin' || this.isQuitting) {
            app.quit()
            app.exit(0)
          }
        })

        app.on('activate', async () => {
          if (this.win === null) {
            await this.createWindow()
          }
        })

        app.on('before-quit', () => {
          this.isQuitting = true
        })
      } catch (e) {
        reject(e)
      }
    })
  }

  createWindow(): void {
    this.win = new BrowserWindow({
      width: this.defaultWidth,
      height: this.defaultHeight,
      minWidth: this.defaultWidth,
      minHeight: this.defaultHeight,
      icon: path.join(
        __dirname,
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    })
    remote.enable(this.win.webContents)

    Menu.setApplicationMenu(null)

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

    ipcMain.on('change-tray', (event: Event, cards: Array<Card>) => {
      this.menuItems = []
      this.cards = cards || []
      this.cards.forEach(card => {
        this.menuItems.push({
          label: card.sysname,
          click: () => {
            this.openBrowser(card)
          },
        })
      })
      this.changeTrayMenu()
    })

    ipcMain.handle('read-file', (_event: Event, path: string): string => {
      let data = ''
      try {
        data = fs.readFileSync(path, 'utf8')
      } catch (_) {}
      return data
    })

    ipcMain.on('open-browser', (event: Event, card: Card) => {
      this.openBrowser(card)
    })

    ipcMain.handle('storage-get', (event, key: string): string => {
      return this.store.get(key, '')
    })

    ipcMain.handle('storage-save', (event: Event, key: string, value: string): void => {
      return this.store.set(key, value)
    })
  }

  openBrowser(card: Card): void {
    const win = new BrowserWindow({
      width: card.width,
      height: card.height,
      icon: path.join(
        __dirname,
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
    })
    win.loadURL(card.url)
  }

  enableTray(): void {
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
    this.tray.setToolTip('passbox')
    const toggleWindow = () => {
      if (!this.win) {
        return
      }
      this.win.show()
      this.win.focus()
      if (process.platform === 'darwin') {
        app.dock.show()
      }
    }
    this.tray.on('click', () => toggleWindow())
    this.tray.on('double-click', () => toggleWindow())
    this.tray.on('right-click', () => {
      this.tray.popUpContextMenu(this.contextMenu)
    })
  }

  changeTrayMenu(): void {
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
    const menuItemOptions: Array<MenuItemConstructorOptions> = [
      ...initMenuItemOptions,
      ...this.menuItems,
    ]
    this.contextMenu = Menu.buildFromTemplate(menuItemOptions)
    if (process.platform !== 'darwin') {
      this.tray.setContextMenu(this.contextMenu)
    }
  }
}

const main = new Main()
main.bootstrap()
