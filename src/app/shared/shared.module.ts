import { NgModule, ModuleWithProviders } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { LyButtonModule } from '@alyle/ui/button'
import { LyIconModule } from './icon'
import { SafePipeModule } from './safe-pipe'

@NgModule({
  declarations: [],
  providers: [],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LyButtonModule,
    LyIconModule,
    SafePipeModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    LyButtonModule,
    LyIconModule,
    SafePipeModule,
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: [],
    }
  }
}
