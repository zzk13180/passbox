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
      this.mainWindow.win.webContents.openDevTools()
      this.mainWindow.win.loadURL('http://localhost:4200')
    } else {
      this.mainWindow.win.loadURL(
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
  if (!main.mainWindow.win) {
    main.bootstrap()
  } else if (process.platform === 'darwin' && !hasVisibleWindows) {
    main.mainWindow.win.show()
    app.dock.show()
  }
})

if (!app.requestSingleInstanceLock()) {
  app.quit()
  app.exit(0)
} else {
  app.on('second-instance', () => {
    const { win } = main.mainWindow
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
