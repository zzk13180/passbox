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
import { ElectronService, selectCurrentLanguage } from 'src/app/services'
import { Card } from 'src/app/models'
import { I18nText } from './help.i18n'
import { STYLES } from './STYLES.data'

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [I18nText],
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
    this.store.select(selectCurrentLanguage).subscribe(language => {
      this.i18nText.currentLanguage = language
      this._cd.markForCheck()
    })
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
      width: 850,
      height: 650,
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
