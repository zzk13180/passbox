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
import { MinimaLight } from '@alyle/ui/themes/minima'
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
import { HomeRoutingModule } from './home-routing.module'
import { FileDropDirective } from './file-drop.directive'
import { HomeComponent } from './home.component'
import { CardAddDialog } from './components/card-add/card-add-dialog'
import { CardDeletedDialog } from './components/card-deleted/card-deleted-dialog'
import { ExportSelectDialog } from './components/export/export-select-dialog'
import { ImportPasswordDialog } from './components/import/import-password-dialog'
import { PasswordSetDialog } from './components/password/password-set-dialog'
import { SearchComponent } from './components/search/search'
import { homeSecretShowComponent } from './components/secret-show/secret-show'

@NgModule({
  declarations: [
    CardAddDialog,
    HomeComponent,
    SearchComponent,
    CardDeletedDialog,
    homeSecretShowComponent,
    PasswordSetDialog,
    ExportSelectDialog,
    ImportPasswordDialog,
    FileDropDirective,
  ],
  entryComponents: [CardAddDialog, CardDeletedDialog],
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
    ReactiveFormsModule,
  ],
  providers: [
    LyTheme2,
    StyleRenderer,
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true },
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
