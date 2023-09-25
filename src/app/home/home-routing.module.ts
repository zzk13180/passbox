import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HomeComponent } from './home.component'

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'apps/note',
    loadChildren: () => import('./apps/note/note.module').then(m => m.NoteModule),
  },
  {
    path: 'apps/test-viewer',
    loadChildren: () =>
      import('./apps/test-viewer/test-viewer.module').then(m => m.TestViewerModule),
  },
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
