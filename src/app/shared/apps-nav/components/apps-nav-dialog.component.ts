import { Component, ChangeDetectionStrategy } from '@angular/core'
import { LyDialogRef } from '@alyle/ui/dialog'
import { Router } from '@angular/router'
import { LyClasses, StyleRenderer } from '@alyle/ui'
import { STYLES } from './STYLES.data'

@Component({
  templateUrl: './apps-nav-dialog.component.html',
  styleUrls: ['./apps-nav-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppsNavDialogComponent {
  readonly classes: LyClasses<typeof STYLES>
  constructor(
    public dialogRef: LyDialogRef,
    readonly sRenderer: StyleRenderer,
    private router: Router,
  ) {
    this.classes = this.sRenderer.renderSheet(STYLES)
  }

  navigateToPath(path: string) {
    this.router.navigate([path])
    this.dialogRef.close()
  }
}
