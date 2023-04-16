import 'reflect-metadata'

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { LyTheme2, StyleRenderer, LY_THEME, LY_THEME_NAME } from '@alyle/ui'
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { CardEffects } from './effects'
import { AppComponent } from './app.component'
import { HomeModule } from './pages/home/home.module'
import { AppRoutingModule } from './app-routing.module'
import { cardReducer } from './services'

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    CommonModule,
    HomeModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    StoreModule.forRoot({ card: cardReducer }),
    EffectsModule.forRoot([CardEffects]),
  ],
  providers: [
    [LyTheme2],
    [StyleRenderer],
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true }, // name: `minima-light`
    { provide: LY_THEME, useClass: MinimaDark, multi: true }, // name: `minima-dark`
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
