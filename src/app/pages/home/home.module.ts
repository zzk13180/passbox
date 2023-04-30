import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ScrollingModule } from '@angular/cdk/scrolling'
import {
  LyTheme2,
  StyleRenderer,
  LY_THEME,
  LY_THEME_NAME,
  LyExpansionIconModule,
} from '@alyle/ui'
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima'
import { LyTabsModule } from '@alyle/ui/tabs'
import { LyIconModule } from '@alyle/ui/icon'
import { LyExpansionModule } from '@alyle/ui/expansion'
import { LyTypographyModule } from '@alyle/ui/typography'
import { LyButtonModule } from '@alyle/ui/button'
import { LyDialogModule } from '@alyle/ui/dialog'
import { LyGridModule } from '@alyle/ui/grid'
import { LyFieldModule } from '@alyle/ui/field'
import { LyToolbarModule } from '@alyle/ui/toolbar'
import { LySnackBarModule } from '@alyle/ui/snack-bar'
import { LyMenuModule } from '@alyle/ui/menu'
import { LyDividerModule } from '@alyle/ui/divider'
import { LyListModule } from '@alyle/ui/list'
import { LySelectModule } from '@alyle/ui/select'
import { LyTableModule } from '@alyle/ui/table'
import { LyTooltipModule } from '@alyle/ui/tooltip'
import { HomeComponent, AddDialog, DeletedCardsDialog } from './home.component'
import { SearchComponent } from './search.component'
import { HomeRoutingModule } from './home-routing.module'
import { homeSecretComponent } from './secret'
import { PasswordSet } from './password-set-dialog.component'
import { SelectExportDialog } from './select-export-dialog'
import { ImportPasswordDialog } from './import-password-dialog'

@NgModule({
  declarations: [
    HomeComponent,
    SearchComponent,
    AddDialog,
    DeletedCardsDialog,
    homeSecretComponent,
    PasswordSet,
    SelectExportDialog,
    ImportPasswordDialog,
  ],
  entryComponents: [AddDialog, DeletedCardsDialog],
  imports: [
    CommonModule,
    HomeRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    DragDropModule,
    LyTabsModule,
    LyIconModule,
    LyExpansionModule,
    ScrollingModule,
    LyButtonModule,
    LyExpansionIconModule,
    FormsModule,
    LyDialogModule,
    LyGridModule,
    LyTypographyModule,
    LyFieldModule,
    LySelectModule,
    LySnackBarModule,
    LyToolbarModule,
    LyMenuModule,
    LyDividerModule,
    LyListModule,
    LyTableModule,
    LyTooltipModule,
    ReactiveFormsModule,
  ],
  providers: [
    [LyTheme2],
    [StyleRenderer],
    { provide: LY_THEME_NAME, useFactory: () => 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true },
    { provide: LY_THEME, useClass: MinimaDark, multi: true },
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
