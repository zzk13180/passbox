/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
show help dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component } from '@angular/core'
import { LyTheme2 } from '@alyle/ui'
import { ElectronService, NotificationService } from 'src/app/services'
import { Card } from '../../../models'

const STYLES = {
  toolbar: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  toolbarIcon: {
    marginRight: '16px',
  },
  title: {
    fontFamily: 'Slkscr',
  },
  drawerContainer: {
    height: '270px',
    transform: 'translate3d(0,0,0)',
  },
  drawerContent: {
    padding: 0,
  },
  card: {
    minWidth: '320px',
    minHeight: '320px',
  },
  icon: {
    margin: '0 8px',
  },
  linkbtn: {
    margin: '4px',
  },
}

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.html',
})
export class HelpDialog {
  readonly classes = this._theme.addStyleSheet(STYLES)
  appInfo = {
    name: '',
    version: '',
  }

  constructor(
    private _theme: LyTheme2,
    private electronService: ElectronService,
    private notificationService: NotificationService,
  ) {
    this.getAppInfo().then(appInfo => {
      this.appInfo = appInfo
    })
  }

  showTutorialDialog() {
    this.notificationService.sendNotification('showTutorialDialog')
  }

  openDevTools() {
    this.electronService.openDevTools()
  }

  openBrowser(flag: string) {
    const card: Card = {
      id: 'help',
      title: 'from help dialog',
      url: 'https://www.zhangzhankui.com/',
      description: '',
      secret: '',
      width: 800,
      height: 600,
    }
    switch (flag) {
      case 'issues':
        card.url = 'https://github.com/zzk13180/passbox/issues'
        break
      case 'doc':
        card.url = 'https://apps.zhangzhankui.com/passbox'
        break
      default:
        break
    }
    this.electronService.openBrowser(card)
  }

  private async getAppInfo() {
    const appInfo = await this.electronService.getAppInfo()
    return appInfo
  }
}
