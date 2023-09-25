import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { TestViewerRoutingModule } from './test-viewer-routing.module'
import { TestViewerComponent } from './test-viewer.component'

@NgModule({
  declarations: [TestViewerComponent],
  imports: [TestViewerRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TestViewerModule {}
