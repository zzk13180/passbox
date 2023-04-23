import 'reflect-metadata'
import { NgModule } from '@angular/core'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { HomeModule } from './pages/home/home.module'
import { CardEffects } from './effects'
import { cardReducer } from './services'

@NgModule({
  declarations: [AppComponent],
  imports: [
    HomeModule,
    AppRoutingModule,
    StoreModule.forRoot({ theCards: cardReducer }),
    EffectsModule.forRoot([CardEffects]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
