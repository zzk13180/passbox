import { Component } from '@angular/core'
import { LyClasses, StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui'

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
export class AppComponent implements WithStyles {
  readonly classes: LyClasses<typeof STYLES>
  constructor(readonly sRenderer: StyleRenderer) {
    this.classes = this.sRenderer.renderSheet(STYLES, true)
  }
}
