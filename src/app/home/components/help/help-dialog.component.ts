/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
show help dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core'
import { LyTheme2 } from '@alyle/ui'
import { Subscription } from 'rxjs'
import { I18nService, ElectronService, NotificationService } from 'src/app/services'
import { Card } from '../../../models'
import { I18nText } from './help.i18n'
import { STYLES } from './STYLES.data'

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpDialog implements OnInit, OnDestroy {
  readonly classes = this._theme.addStyleSheet(STYLES)
  i18nText: I18nText = new I18nText()
  appInfo = {
    name: '',
    version: '',
  }

  private subscription: Subscription
  // eslint-disable-next-line max-params
  constructor(
    private _theme: LyTheme2,
    private _cd: ChangeDetectorRef,
    private electronService: ElectronService,
    private notificationService: NotificationService,
    private i18nService: I18nService,
  ) {
    this.getAppInfo().then(appInfo => {
      this.appInfo = appInfo
      this._cd.markForCheck()
    })
  }

  ngOnInit(): void {
    this.subscription = this.i18nService.languageChanges().subscribe(data => {
      this.i18nText.currentLanguage = data
      this._cd.markForCheck()
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

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
}
