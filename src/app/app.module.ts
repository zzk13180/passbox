import 'reflect-metadata'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import {
  LY_THEME,
  LY_THEME_NAME,
  LY_THEME_GLOBAL_VARIABLES,
  PartialThemeVariables,
} from '@alyle/ui'
import { LyButtonModule } from '@alyle/ui/button'
import { MinimaLight } from '@alyle/ui/themes/minima'
import { LySnackBarModule } from '@alyle/ui/snack-bar'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { LocationStrategy, HashLocationStrategy } from '@angular/common'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { HomeModule } from './home/home.module'
import { CardEffects, Settingsffects } from './effects'
import { STORAGE_PROVIDERS, cardReducer, settingsReducer } from './services'
import { LyIconModule } from './shared/icon'

class GlobalVariables implements PartialThemeVariables {
  typography = {
    fontFamily:
      "'Noto Sans Arabic', 'Noto Sans', 'Noto Sans JP', 'Noto Sans SC', sans-serif",
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LySnackBarModule,
    LyButtonModule,
    LyIconModule,
    HomeModule,
    StoreModule.forRoot({ theCards: cardReducer, theSettings: settingsReducer }),
    EffectsModule.forRoot([CardEffects, Settingsffects]),
  ],
  providers: [
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true },
    { provide: LY_THEME_GLOBAL_VARIABLES, useClass: GlobalVariables },
    STORAGE_PROVIDERS,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
