import {
  Component,
  NgZone,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core'
import { Store } from '@ngrx/store'
import { Subscription } from 'rxjs'
import { LyDialogRef } from '@alyle/ui/dialog'
import { CardsPermissionsService, resetCards } from 'src/app/services'
import type { NgModel } from '@angular/forms'

@Component({
  templateUrl: './login-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialog implements AfterViewInit, OnDestroy {
  see = true
  _password = ''
  @ViewChild('passwordModel') passwordModel: NgModel
  private readonly subscription = new Subscription()
  // eslint-disable-next-line max-params
  constructor(
    public dialogRef: LyDialogRef,
    private cardsPermissionsService: CardsPermissionsService,
    private ngZone: NgZone,
    private store: Store,
    private _cd: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    const encoder = new TextEncoder()
    this.subscription.add(
      this.passwordModel.valueChanges.subscribe((password: string) => {
        const { byteLength } = encoder.encode(password)
        if (byteLength > 64) {
          this.passwordModel.control.setErrors({ maxbyte: true })
        }
      }),
    )
  }

  reset() {
    const { dialog } = window.electronAPI
    dialog.showMessageBox(
      {
        type: 'question',
        message: 'Reset Data',
        detail:
          'Warning: Resetting will result in the loss of all data! Are you sure to proceed?',
        buttons: ['Cancel', 'Yes'],
        defaultId: 0,
        cancelId: 0,
        noLink: true,
      },
      result => {
        if (result.response === 1) {
          this.ngZone.run(() => {
            this.store.dispatch(resetCards())
            this.dialogRef.close()
            this._cd.detectChanges()
          })
        }
      },
    )
  }

  async ok() {
    if (!this.passwordModel.valid) {
      return
    }
    const loginOk = await this.login()
    if (!loginOk) {
      this.ngZone.run(() => {
        this.passwordModel.control.setErrors({ passwordFail: true })
        this._cd.detectChanges()
      })
    } else {
      this.dialogRef.close()
    }
  }

  private async login(): Promise<boolean> {
    try {
      await this.cardsPermissionsService.verifyUserPassword(this._password)
    } catch (_) {
      return false
    }
    return true
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.ok()
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}
