import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { NoteRootComponent } from './note.component'
import { HomeComponent } from './pages/home/home.component'
import { ListComponent } from './pages/list/list.component'

const routes: Routes = [
  {
    path: '',
    component: NoteRootComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'list',
        component: ListComponent,
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoteRoutingModule {}
