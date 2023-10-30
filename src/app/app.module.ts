import 'reflect-metadata'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { LocationStrategy, HashLocationStrategy } from '@angular/common'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { HomeModule } from './home/home.module'
import { CardEffects, Settingsffects } from './effects'
import {
  STORAGE_PROVIDERS,
  cardReducer,
  settingsReducer,
  KeyboardService,
} from './services'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HomeModule,
    StoreModule.forRoot({ theCards: cardReducer, theSettings: settingsReducer }),
    EffectsModule.forRoot([CardEffects, Settingsffects]),
  ],
  providers: [
    KeyboardService,
    STORAGE_PROVIDERS,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
