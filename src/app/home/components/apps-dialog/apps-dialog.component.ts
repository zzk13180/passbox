import { Component, ChangeDetectionStrategy } from '@angular/core'
import { LyDialogRef } from '@alyle/ui/dialog'
import { ThemeVariables, lyl, StyleRenderer } from '@alyle/ui'

const STYLES = (theme: ThemeVariables) => {
  const { breakpoints } = theme
  return {
    box: lyl`{
      width: 100%
      min-width: 64px
      min-height: 64px
      display: flex
      align-items: center
      justify-content: center
      overflow: hidden
      white-space: nowrap
      text-overflow: ellipsis

      @media ${breakpoints.XSmall} {
        height: 82px
        button {
          width: 82px
          height: 82px
        }
      }
 
      @media ${breakpoints.Small} {
        height: 106px
        button {
          width: 106px
          height: 106px
        }
      }
 
      @media ${breakpoints.Medium} {
        height: 152px
        button {
          width: 152px
          height: 152px
        }
      }
   
      @media ${breakpoints.Large} {
        height: 116px
        button {
          width: 116px
          height: 116px
        }
      }
 
      @media ${breakpoints.XLarge} {
        height: 144px
        button {
          width: 144px
          height: 144px
        }
      }

    }`,
  }
}

@Component({
  templateUrl: './apps-dialog.component.html',
  styleUrls: ['./apps-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppsDialog {
  readonly classes = this.sRenderer.renderSheet(STYLES)
  constructor(
    public dialogRef: LyDialogRef,
    readonly sRenderer: StyleRenderer,
  ) {}
}
