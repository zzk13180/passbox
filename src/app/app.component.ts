import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core'
import { LyClasses, StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui'
import { LySnackBar } from '@alyle/ui/snack-bar'
import { Subject, takeUntil } from 'rxjs'
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
export class AppComponent implements WithStyles, OnInit, OnDestroy {
  @ViewChild('messages') messages: LySnackBar
  readonly classes: LyClasses<typeof STYLES>
  private destroy$ = new Subject()
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
    this.messageService.messagesObs.pipe(takeUntil(this.destroy$)).subscribe(message => {
      this.queue.push(message)
      if (!this.executing) {
        this.executeQueue()
      }
    })
    this.store.dispatch(getSettings())
  }

  ngOnDestroy() {
    this.destroy$.next(true)
    this.destroy$.complete()
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
