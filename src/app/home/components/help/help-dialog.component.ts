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
import { LyClasses, LyTheme2 } from '@alyle/ui'
import { Store } from '@ngrx/store'
import { ElectronService, selectLanguage } from 'src/app/services'
import { Card } from '../../../models'
import { I18nText } from './help.i18n'
import { STYLES } from './STYLES.data'

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpDialog implements OnInit, OnDestroy {
  readonly classes: LyClasses<typeof STYLES>
  appInfo = {
    name: '',
    version: '',
  }

  // eslint-disable-next-line max-params
  constructor(
    public i18nText: I18nText,
    private store: Store,
    private _theme: LyTheme2,
    private _cd: ChangeDetectorRef,
    private electronService: ElectronService,
  ) {
    this.classes = this._theme.addStyleSheet(STYLES)
  }

  ngOnInit(): void {
    this.getAppInfo().then(appInfo => {
      this.appInfo = appInfo
      this._cd.markForCheck()
    })
    this.store.select(selectLanguage).subscribe(language => {
      this.i18nText.currentLanguage = language
      this._cd.markForCheck()
    })
  }

  showTutorialDialog() {
    // TODO
    // this.notificationService.sendNotification('showTutorialDialog')
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

  ngOnDestroy() {}
}