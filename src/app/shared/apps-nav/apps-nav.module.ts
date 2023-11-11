import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LyToolbarModule } from '@alyle/ui/toolbar'
import { LyGridModule } from '@alyle/ui/grid'
import { LyTypographyModule } from '@alyle/ui/typography'
import { LyButtonModule } from '@alyle/ui/button'
import { LyDialogModule } from '@alyle/ui/dialog'
import { LyIconModule } from '../icon'
import { AppsNavComponent } from './apps-nav.component'
import { AppsNavDialogComponent } from './components/apps-nav-dialog.component'

@NgModule({
  declarations: [AppsNavComponent, AppsNavDialogComponent],
  imports: [
    CommonModule,
    LyButtonModule,
    LyToolbarModule,
    LyGridModule,
    LyIconModule,
    LyTypographyModule,
    LyDialogModule,
  ],
  exports: [AppsNavComponent],
})
export class AppsNavModule {}
