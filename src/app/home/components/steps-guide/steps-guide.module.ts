import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { LyButtonModule } from '@alyle/ui/button'
import { LyIconModule } from 'src/app/icon'
import { OverlayContainerRef } from './overlay-container'
import { PositioningModule } from './positioning/positioning.module'
import { SafePipeModule } from './safe-pipe.module'
import { StepsGuideComponent } from './steps-guide.component'
import { StepsGuideDirective } from './steps-guide.directive'
import { StepsGuideService } from './steps-guide.service'

@NgModule({
  imports: [
    CommonModule,
    SafePipeModule,
    PositioningModule,
    LyButtonModule,
    LyIconModule,
  ],
  declarations: [StepsGuideComponent, StepsGuideDirective],
  exports: [StepsGuideDirective],
  providers: [OverlayContainerRef, StepsGuideService],
})
export class StepsGuideModule {}
