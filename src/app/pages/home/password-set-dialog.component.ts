import {
  Component,
  Inject,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
} from '@angular/core'
import { LyDialogRef, LY_DIALOG_DATA } from '@alyle/ui/dialog'
import { UseStateService, DbService, ElectronService } from '../../services'
import { StorageKey } from '../../enums/storageKey'
import type { NgModel } from '@angular/forms'
import type { CardState } from '../../models'

@Component({
  templateUrl: './password-set-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordSet implements AfterViewInit {
  see = true
  _password = ''
  @ViewChild('passwordModel') passwordModel: NgModel
  // eslint-disable-next-line max-params
  constructor(
    public dialogRef: LyDialogRef,
    private useStateService: UseStateService,
    private dbService: DbService,
    private ngZone: NgZone,
    private _cd: ChangeDetectorRef,
    private electronService: ElectronService,
    @Inject(LY_DIALOG_DATA)
    public data: {
      isLogin: boolean
    },
  ) {
    this.see = !this.data.isLogin
  }

  ngAfterViewInit(): void {
    const encoder = new TextEncoder()
    this.passwordModel.valueChanges.subscribe((password: string) => {
      const { byteLength } = encoder.encode(password)
      if (byteLength > 14) {
        this.passwordModel.control.setErrors({ maxbyte: true })
      }
    })
  }

  reset() {
    this.electronService.remote.dialog
      .showMessageBox(this.electronService.remote.BrowserWindow.getFocusedWindow(), {
        type: 'question',
        title: 'confirm',
        message: 'reset data',
        detail: 'reset will lose all data ! are you sure ?',
        buttons: ['yes', 'cancel'],
        defaultId: 1,
        cancelId: 1,
        noLink: true,
      })
      .then(async result => {
        if (result.response === 0) {
          await this.electronService.storageClear()
          this.dialogRef.close()
        }
      })
  }

  async ok() {
    if (!this.passwordModel.valid) {
      return
    }
    if (!this.data.isLogin) {
      await this.changePassword()
      this.dialogRef.close()
    } else {
      const loginOk = await this.login()
      if (!loginOk) {
        this.ngZone.run(() => {
          this.passwordModel.control.setErrors({ passwordFail: true })
          this._cd.detectChanges()
        })
      } else {
        this.dialogRef.close(true)
      }
    }
  }

  private async changePassword() {
    let theCards: CardState
    try {
      theCards = await this.dbService.getItem(StorageKey.cards)
    } catch (_) {}
    await this.useStateService.setUserPassword(this._password)
    try {
      theCards && (await this.dbService.setItem(StorageKey.cards, theCards))
    } catch (_) {}
  }

  private async login(): Promise<boolean> {
    await this.useStateService.setUserPassword(this._password)
    try {
      await this.dbService.getItem(StorageKey.cards)
    } catch (_) {
      return false
    }
    return true
  }
}
