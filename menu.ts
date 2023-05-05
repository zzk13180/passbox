import { BrowserWindow, clipboard, MenuItemConstructorOptions } from 'electron'

export class BrowserMenu {
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
    const copyUrl: MenuItemConstructorOptions = {
      label: 'Copy Current URL',
      accelerator: 'CmdOrCtrl+L',
      click: (): void => clipboard.writeText(this.win.webContents.getURL()),
    }
    return [copyUrl, viewMenu]
  }
}
