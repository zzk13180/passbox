import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LyTabsModule } from '@alyle/ui/tabs'
import { LyIconModule } from '@alyle/ui/icon'
import { LyExpansionIconModule, LyCommonModule } from '@alyle/ui'
import { LyExpansionModule } from '@alyle/ui/expansion'
import { LyTypographyModule } from '@alyle/ui/typography'
import { LyButtonModule } from '@alyle/ui/button'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { LyDialogModule } from '@alyle/ui/dialog'
import { LyGridModule } from '@alyle/ui/grid'
import { LyFieldModule } from '@alyle/ui/field'
import { LyToolbarModule } from '@alyle/ui/toolbar'
import { LySnackBarModule } from '@alyle/ui/snack-bar'
import { LyMenuModule } from '@alyle/ui/menu'
import { LyDividerModule } from '@alyle/ui/divider'
import { LyListModule } from '@alyle/ui/list'
import { LySelectModule } from '@alyle/ui/select'
import { LyAvatarModule } from '@alyle/ui/avatar'
import { HomeComponent, AddDialog } from './home.component'
import { HomeRoutingModule } from './home-routing.module'

@NgModule({
  declarations: [HomeComponent, AddDialog],
  entryComponents: [AddDialog],
  imports: [
    CommonModule,
    LyTabsModule,
    LyIconModule,
    LyExpansionModule,
    LyTypographyModule,
    LyButtonModule,
    LyExpansionIconModule,
    CommonModule,
    FormsModule,
    LyDialogModule,
    LyGridModule,
    LyButtonModule,
    LyTypographyModule,
    LyFieldModule,
    LyCommonModule,
    LySelectModule,
    LySnackBarModule,
    LyToolbarModule,
    LyMenuModule,
    LyDividerModule,
    LyListModule,
    LyAvatarModule,
    ReactiveFormsModule,
    HomeRoutingModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
