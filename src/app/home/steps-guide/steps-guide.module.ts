import { NgModule } from '@angular/core'
import { SharedModule } from 'src/app/shared/shared.module'
import { OverlayContainerRef } from './overlay-container-ref'
import { StepsGuideComponent } from './steps-guide.component'
import { StepsGuideDirective } from './steps-guide.directive'
import { StepsGuideService } from './steps-guide.service'
import { PositionService } from './position.service'

@NgModule({
  imports: [SharedModule],
  declarations: [StepsGuideComponent, StepsGuideDirective],
  exports: [StepsGuideDirective],
  providers: [OverlayContainerRef, StepsGuideService, PositionService],
})
export class StepsGuideModule {}
