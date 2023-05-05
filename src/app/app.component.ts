import { Component } from '@angular/core'
import { StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui'

const STYLES = (theme: ThemeVariables) => ({
  $global: lyl`{
    body {
      background-color: ${theme.background.default}
      color: ${theme.text.default}
      font-family: ${theme.typography.fontFamily}
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
  readonly classes = this.sRenderer.renderSheet(STYLES, true)
  constructor(readonly sRenderer: StyleRenderer) {}
}
