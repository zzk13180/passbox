import path from 'node:path'
import { app, Menu } from 'electron'
import { MainWindow } from './main-window'

const SERVE_FLAG = '--serve'
const DEV_URL = 'http://localhost:4200'
const PROD_URL = `file://${path.join(__dirname, '../', 'dist/index.html')}`

class Main {
  mainWindow: MainWindow

  get isDev(): boolean {
    const args = process.argv.slice(1)
    return args.some(val => val === SERVE_FLAG)
  }

  constructor() {
    this.setupPaths()
    this.setupMenu()
    this.mainWindow = new MainWindow(this.isDev)
  }

  bootstrap() {
    this.mainWindow.init()
    this.loadURL()
  }

  private setupPaths() {
    if (this.isDev) {
      const appDataPath = app.getAppPath()
      app.setPath('userData', `${appDataPath}/${app.name}-user-data`)
      app.setPath('logs', path.join(app.getPath('userData'), 'logs'))
    }
    // does not rely on browser storage
    app.setPath('sessionData', app.getPath('temp'))
  }

  private setupMenu() {
    if (process.platform !== 'darwin') {
      Menu.setApplicationMenu(null)
    }
  }

  private loadURL() {
    if (this.isDev) {
      this.mainWindow.browserWindow.loadURL(DEV_URL)
      this.mainWindow.browserWindow.webContents.openDevTools()
    } else {
      this.mainWindow.browserWindow.loadURL(PROD_URL)
    }
  }
}

const main = new Main()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' || main.mainWindow.isQuitting) {
    app.quit()
    app.exit(0)
  }
})

app.on('before-quit', () => {
  main.mainWindow.isQuitting = true
})

app.on('ready', () => {
  main.bootstrap()
})

app.on('activate', (_e, hasVisibleWindows: boolean) => {
  if (!main.mainWindow.browserWindow) {
    main.bootstrap()
  } else if (process.platform === 'darwin' && !hasVisibleWindows) {
    main.mainWindow.browserWindow.show()
    app.dock.show()
  }
})

if (!app.requestSingleInstanceLock()) {
  app.quit()
  app.exit(0)
} else {
  app.on('second-instance', () => {
    const { browserWindow } = main.mainWindow
    if (browserWindow) {
      if (!browserWindow.isVisible()) {
        browserWindow.show()
      }
      if (browserWindow.isMinimized()) {
        browserWindow.restore()
      }
      browserWindow.once('ready-to-show', () => {
        browserWindow.show()
      })
      browserWindow.focus()
    }
  })
}
