import { Component, ViewChild, OnInit } from '@angular/core'
import { LyClasses, StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui'
import { LySnackBar } from '@alyle/ui/snack-bar'
import { Store } from '@ngrx/store'
import { MessageService, getSettings } from './services'

const STYLES = (theme: ThemeVariables) => ({
  $global: lyl`{
    body {
      background-color: ${theme.background.default}
      color: ${theme.text.default}
      margin: 0
      direction: ${theme.direction}
    }
  }`,
  root: lyl`{
    display: block
  }`,
})

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [StyleRenderer],
})
export class AppComponent implements WithStyles, OnInit {
  @ViewChild('messages') messages: LySnackBar
  readonly classes: LyClasses<typeof STYLES>
  private queue = []
  private executing = false
  constructor(
    readonly sRenderer: StyleRenderer,
    private messageService: MessageService,
    private store: Store,
  ) {
    this.classes = this.sRenderer.renderSheet(STYLES, true)
  }

  ngOnInit() {
    // appcomponent is never destroyed don not need to unsubscribe
    this.messageService.messagesObs.subscribe(message => {
      this.queue.push(message)
      if (!this.executing) {
        this.executeQueue()
      }
    })
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
}
