import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { MatTooltipModule } from '@angular/material/tooltip'
import {
  LyTheme2,
  StyleRenderer,
  LY_THEME,
  LY_THEME_NAME,
  LyOverlayModule,
  LyExpansionIconModule,
  LY_THEME_GLOBAL_VARIABLES,
  PartialThemeVariables,
} from '@alyle/ui'
import { MinimaLight } from '@alyle/ui/themes/minima'
import { LyTabsModule } from '@alyle/ui/tabs'
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
import { LyDrawerModule } from '@alyle/ui/drawer'
import { LyCardModule } from '@alyle/ui/card'
import { LyIconModule } from 'src/app/icon'
import { HomeRoutingModule } from './home-routing.module'
import { FileDropDirective } from './file-drop.directive'
import { HomeComponent } from './home.component'
import { CardAddDialog } from './components/card-add/card-add-dialog'
import { CardDeletedDialog } from './components/card-deleted/card-deleted-dialog'
import { ExportSelectDialog } from './components/export/export-select-dialog'
import { ImportPasswordDialog } from './components/import/import-password-dialog'
import { PasswordSetDialog } from './components/password/password-set-dialog'
import { AppsDialog } from './components/apps-dialog/apps-dialog'
import { HelpDialog } from './components/help/help-dialog'
import { PasswordGeneratorDialog } from './components/password-generator/password-generator'
import { SearchComponent } from './components/search/search'
import { homeSecretShowComponent } from './components/secret-show/secret-show'
import { StepsGuideModule } from './components/steps-guide'
import { TutorialDialog } from './components/tutorial/tutorial'

class GlobalVariables implements PartialThemeVariables {
  typography = {
    fontFamily: "'Noto Sans Arabic', Roboto, 'Noto Sans JP', 'Noto Sans SC', sans-serif",
  }
}

@NgModule({
  declarations: [
    HelpDialog,
    AppsDialog,
    CardAddDialog,
    HomeComponent,
    SearchComponent,
    CardDeletedDialog,
    homeSecretShowComponent,
    PasswordGeneratorDialog,
    PasswordSetDialog,
    ExportSelectDialog,
    ImportPasswordDialog,
    FileDropDirective,
    TutorialDialog,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatTooltipModule,
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
    LyOverlayModule,
    LyDrawerModule,
    LyCardModule,
    ReactiveFormsModule,
    StepsGuideModule,
  ],
  providers: [
    LyTheme2,
    StyleRenderer,
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true },
    { provide: LY_THEME_GLOBAL_VARIABLES, useClass: GlobalVariables },
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
