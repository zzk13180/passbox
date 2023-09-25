import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { TestViewerComponent } from './test-viewer.component'

const routes: Routes = [
  {
    path: '',
    component: TestViewerComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestViewerRoutingModule {}
