import 'reflect-metadata'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { LySnackBarModule } from '@alyle/ui/snack-bar'
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
  MessageService,
  KeyboardShortcutsService,
} from './services'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LySnackBarModule,
    HomeModule,
    StoreModule.forRoot({ theCards: cardReducer, theSettings: settingsReducer }),
    EffectsModule.forRoot([CardEffects, Settingsffects]),
  ],
  providers: [
    MessageService,
    KeyboardShortcutsService,
    STORAGE_PROVIDERS,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
