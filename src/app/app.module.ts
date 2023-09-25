import 'reflect-metadata'
import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { LocationStrategy, HashLocationStrategy } from '@angular/common'

import { MaterialModule } from './material'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { HomeModule } from './home/home.module'
import { CardEffects } from './effects'
import { WindowToken, windowProvider, STORAGE_PROVIDERS, cardReducer } from './services'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HomeModule,
    MaterialModule.forRoot(),
    StoreModule.forRoot({ theCards: cardReducer }),
    EffectsModule.forRoot([CardEffects]),
  ],
  providers: [
    { provide: WindowToken, useFactory: windowProvider },
    STORAGE_PROVIDERS,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
