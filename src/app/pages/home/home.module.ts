import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
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
import { HomeComponent, AddDialog, DeletedCardsDialog } from './home.component'
import { SearchComponent } from './search.component'
import { HomeRoutingModule } from './home-routing.module'
import { homePasswordComponent } from './password'
import { PasswordSet } from './password-set-dialog.component'

function themeNameProviderFactory() {
  // if (typeof localStorage === 'object') {
  //   const themeName = localStorage.getItem('theme-name')
  //   if (themeName) {
  //     return themeName
  //   }
  // }
  return 'minima-light'
}

@NgModule({
  declarations: [
    HomeComponent,
    SearchComponent,
    AddDialog,
    DeletedCardsDialog,
    homePasswordComponent,
    PasswordSet,
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
    LyTypographyModule,
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
    [LyTheme2],
    [StyleRenderer],
    { provide: LY_THEME_NAME, useFactory: themeNameProviderFactory },
    { provide: LY_THEME, useClass: MinimaLight, multi: true }, // name: `minima-light`
    { provide: LY_THEME, useClass: MinimaDark, multi: true }, // name: `minima-dark`
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
