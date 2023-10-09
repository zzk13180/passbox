import { NgModule } from '@angular/core'
import { WindowRefModule } from '../window-ref'
import { PositionService } from './positioning.service'

@NgModule({
  imports: [WindowRefModule],
  providers: [PositionService],
})
export class PositioningModule {}
