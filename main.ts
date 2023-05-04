import * as path from 'node:path'
import * as fs from 'node:fs'
import * as dns from 'node:dns'
import { parse } from 'node:url'
import {
  app,
  Tray,
  Menu,
  dialog,
  ipcMain,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron'

const Store = require('electron-store')
const remote = require('@electron/remote/main')

interface Card {
  id: string
  title: string
  description: string
  secret: string
  url: string
  width?: number
  height?: number
}

class Main {
  windowMain: WindowMain

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
    this.windowMain.init()
    remote.enable(this.windowMain.win.webContents)
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
  private cards: Array<Card> = []

  constructor(
    private isServe = false,
    private store = new Store({
      defaults: {},
      name: 'passbox',
    }),
  ) {}

  init() {
    this.createWindow()
    this.enableTray()
  }

  private createWindow(): void {
    this.win = new BrowserWindow({
      width: 430,
      height: 500,
      icon: path.join(
        __dirname,
        `${this.isServe ? 'src' : 'dist'}/assets/icons/favicon.64x64.png`,
      ),
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    })

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
        if (card && card.title) {
          this.menuItems.push({
            label: card.title,
            click: () => {
              this.openBrowser(card)
            },
          })
        }
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

    ipcMain.handle('storage-clear', (_): void => {
      return this.store.clear()
    })
  }

  private async openBrowser(card: Card): Promise<boolean> {
    const { href, protocol, pathname } = parse(card.url)
    let url = ''
    if (protocol) {
      url = href
    } else if (pathname) {
      url = `http://${href}`
      try {
        // eslint-disable-next-line no-new
        new URL(url)
        const ok = await this.lookupDnsOk(pathname)
        if (!ok) {
          url = ''
        }
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
    this.tray.setToolTip('passbox')
    this.changeTrayMenu()
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
    const menuItemOptions: Array<MenuItemConstructorOptions> = [
      ...initMenuItemOptions,
      ...this.menuItems,
    ]
    this.contextMenu = Menu.buildFromTemplate(menuItemOptions)
    this.tray.setContextMenu(this.contextMenu)
  }

  private async lookupDnsOk(pathname: string): Promise<boolean> {
    const result: boolean = await new Promise(resolve => {
      dns.lookup(pathname, (err, _ip) => {
        if (!err) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
      setTimeout(() => resolve(false), 2 * 1000)
    })
    return result
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
  }
})

if (!app.requestSingleInstanceLock()) {
  app.quit()
  app.exit(0)
} else {
  app.on('second-instance', () => {
    const { win } = main.windowMain
    if (win) {
      win.focus()
      if (win.isMinimized() || !win.isVisible()) {
        win.restore()
      }
      win.once('ready-to-show', () => {
        win.show()
      })
    }
  })
}
