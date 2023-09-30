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
    path: 'apps/emoji',
    loadChildren: () => import('./apps/emoji/emoji.module').then(m => m.EmojiModule),
  },
  {
    path: 'apps/todo',
    loadChildren: () => import('./apps/todo/todo.module').then(m => m.TodoModule),
  },
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
