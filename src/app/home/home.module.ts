import { NgModule } from '@angular/core'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ScrollingModule } from '@angular/cdk/scrolling'
import { MatTooltipModule } from '@angular/material/tooltip'
import {
  LyOverlayModule,
  LyExpansionIconModule,
  StyleRenderer,
  LyTheme2,
} from '@alyle/ui'
import { LyTabsModule } from '@alyle/ui/tabs'
import { LyExpansionModule } from '@alyle/ui/expansion'
import { LyTypographyModule } from '@alyle/ui/typography'
import { LyDialogModule } from '@alyle/ui/dialog'
import { LyGridModule } from '@alyle/ui/grid'
import { LyFieldModule } from '@alyle/ui/field'
import { LyToolbarModule } from '@alyle/ui/toolbar'
import { LyMenuModule } from '@alyle/ui/menu'
import { LyDividerModule } from '@alyle/ui/divider'
import { LyListModule } from '@alyle/ui/list'
import { LySelectModule } from '@alyle/ui/select'
import { LyTableModule } from '@alyle/ui/table'
import { LyDrawerModule } from '@alyle/ui/drawer'
import { LyCardModule } from '@alyle/ui/card'
import { LyRadioModule } from '@alyle/ui/radio'
import { SharedModule } from 'src/app/shared/shared.module'
import { HomeRoutingModule } from './home-routing.module'
import { FileDropDirective } from './file-drop.directive'
import { HomeComponent } from './home.component'
import { CardAddDialog } from './components/card-add/card-add-dialog.component'
import { CardDeletedDialog } from './components/card-deleted/card-deleted-dialog.component'
import { CardHistoryDialog } from './components/card-history/card-history-dialog.component'
import { ExportSelectDialog } from './components/export/export-select-dialog.component'
import { ImportPasswordDialog } from './components/import/import-password-dialog.component'
import { PasswordSetDialog } from './components/password-set/password-set-dialog.component'
import { LoginDialog } from './components/login/login-dialog.component'
import { HelpDialog } from './components/help/help-dialog.component'
import { PasswordGeneratorDialog } from './components/password-generator/password-generator-dialog.component'
import { SearchComponent } from './components/search/search.component'
import { homeSecretShowComponent } from './components/secret-show/secret-show.component'
import { StepsGuideModule } from './steps-guide'
import { TutorialDialog } from './components/tutorial/tutorial.component'
import { SettingsDialog } from './components/settings/settings.component'

@NgModule({
  declarations: [
    HelpDialog,
    CardAddDialog,
    HomeComponent,
    SearchComponent,
    CardDeletedDialog,
    CardHistoryDialog,
    homeSecretShowComponent,
    LoginDialog,
    PasswordSetDialog,
    PasswordGeneratorDialog,
    ExportSelectDialog,
    ImportPasswordDialog,
    FileDropDirective,
    TutorialDialog,
    SettingsDialog,
  ],
  imports: [
    HomeRoutingModule,
    BrowserAnimationsModule,
    MatTooltipModule,
    LyTabsModule,
    LyExpansionModule,
    LyExpansionIconModule,
    LyDialogModule,
    LyGridModule,
    LyTypographyModule,
    LyFieldModule,
    LySelectModule,
    LyToolbarModule,
    LyMenuModule,
    LyDividerModule,
    LyListModule,
    LyTableModule,
    LyOverlayModule,
    LyDrawerModule,
    LyCardModule,
    LyRadioModule,
    ScrollingModule,
    DragDropModule,
    SharedModule,
    StepsGuideModule,
  ],
  providers: [StyleRenderer, LyTheme2],
})
export class HomeModule {}
