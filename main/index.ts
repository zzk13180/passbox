import path from 'node:path'
import { app, Menu } from 'electron'
import { MainWindow } from './main-window'

class Main {
  mainWindow: MainWindow

  constructor() {
    if (this.isServer) {
      const appDataPath = app.getAppPath()
      app.setPath('userData', `${appDataPath}/${app.name}-user-data`)
      app.setPath('logs', path.join(app.getPath('userData'), 'logs'))
    }
    // does not rely on browser storage
    app.setPath('sessionData', app.getPath('temp'))
    if (process.platform !== 'darwin') {
      Menu.setApplicationMenu(null)
    }
    this.mainWindow = new MainWindow(this.isServer)
  }

  get isServer(): boolean {
    const args = process.argv.slice(1)
    return args.some(val => val === '--serve')
  }

  bootstrap() {
    this.mainWindow.init()
    if (this.isServer) {
      this.mainWindow.browserWindow.webContents.openDevTools()
      this.mainWindow.browserWindow.loadURL('http://localhost:4200')
    } else {
      this.mainWindow.browserWindow.loadURL(
        `file://${path.join(__dirname, '../', 'dist/index.html')}`,
      )
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
