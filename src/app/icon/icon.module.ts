import { NgModule, ModuleWithProviders } from '@angular/core'
import { LyCommonModule } from '@alyle/ui'

import { LyIcon } from './icon.directive'

@NgModule({
  declarations: [LyIcon],
  exports: [LyIcon, LyCommonModule],
})
export class LyIconModule {
  static forRoot(): ModuleWithProviders<LyIconModule> {
    return {
      ngModule: LyIconModule,
      providers: [],
    }
  }
}
