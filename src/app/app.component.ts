import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core'
import { LyClasses, StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui'
import { LySnackBar, STYLES as SNACK_STYLES } from '@alyle/ui/snack-bar'
import { Store } from '@ngrx/store'
import { MessageService, getSettings } from './services'
import type { Unsubscribable } from 'rxjs'
import type { SelectorsFn } from '@alyle/ui'

const STYLES = (theme: ThemeVariables, selectors: SelectorsFn) => {
  const snack = selectors(SNACK_STYLES)
  return {
    $global: lyl`{
      body {
        margin: 0
        background-color: ${theme.background.default}
        color: ${theme.text.default}
        direction: ${theme.direction}
        ${snack.root} {
          z-index: ${theme.zIndex.overlay}
        }
      }
    }`,
    root: lyl`{
      display: block
    }`,
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [StyleRenderer],
})
export class AppComponent implements WithStyles, OnInit, OnDestroy {
  @ViewChild('messages') messages: LySnackBar

  readonly classes: LyClasses<typeof STYLES>
  private readonly subscription: Unsubscribable
  private queue = []
  private executing = false

  constructor(
    readonly sRenderer: StyleRenderer,
    private messageService: MessageService,
    private store: Store,
  ) {
    this.classes = this.sRenderer.renderSheet(STYLES, true)
    this.subscription = this.messageService.messagesObs.subscribe(message => {
      this.queue.push(message)
      if (!this.executing) {
        this.executeQueue()
      }
    })
  }

  ngOnInit() {
    this.store.dispatch(getSettings())
  }

  private async executeQueue() {
    this.executing = true
    while (this.queue.length) {
      const message = this.queue.shift()
      this.messages.open(message)
      await new Promise(resolve => setTimeout(resolve, 2000))
      if (this.queue.length) {
        this.messages.dismiss()
      }
    }
    this.executing = false
  }

  ngOnDestroy() {
    // in production this component will never be destroyed
    // just to fix dev console error
    this.subscription?.unsubscribe()
  }
}
