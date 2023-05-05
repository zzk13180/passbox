/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
Toggle whether the secret field is visible 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import { Component, Input } from '@angular/core'
import type { Card } from '../../../models'

@Component({
  selector: 'home-secret-show',
  templateUrl: 'secret-show.html',
})
export class homeSecretShowComponent {
  off = true
  @Input() card: Card
  constructor() {}

  seePassword(event: Event): void {
    event.stopPropagation()
    this.off = !this.off
  }

  getPasswordOffStr(): string {
    let result = ''
    const len = this.card?.secret?.length || 0
    if (len) {
      result = new Array(len + 1).join('*')
    }
    return result
  }
}
