/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
show password-generator dialog 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, ChangeDetectionStrategy, Injector } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { LyDialogRef } from '@alyle/ui/dialog'

@Component({
  templateUrl: './password-generator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordGeneratorDialog {
  securePassword: string
  private window: Window
  constructor(
    public dialogRef: LyDialogRef,
    private injector: Injector,
  ) {
    this.window = this.injector.get(DOCUMENT).defaultView
    this.securePassword = this.generateSecurePassword(22, true, true, true, true)
  }

  // eslint-disable-next-line max-params
  private generateSecurePassword(
    length: number,
    useUppercase = true,
    useLowercase = true,
    useNumbers = true,
    useSpecialChars = true,
  ): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const numberChars = '0123456789'
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?'

    const allowedChars = [
      useUppercase && uppercaseChars,
      useLowercase && lowercaseChars,
      useNumbers && numberChars,
      useSpecialChars && specialChars,
    ]
      .filter(Boolean)
      .join('')

    if (!allowedChars) {
      throw new Error('At least one character type must be allowed.')
    }

    const passwordArray = new Uint8Array(length)
    const crypto = this.window.crypto || (this.window as any).msCrypto

    if (!crypto || !crypto.getRandomValues) {
      throw new Error('Crypto.getRandomValues() is not supported in this environment.')
    }

    crypto.getRandomValues(passwordArray)

    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = passwordArray[i] % allowedChars.length
      password += allowedChars.charAt(randomIndex)
    }

    return password
  }
}
