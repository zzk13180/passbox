import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { EmojiComponent } from './emoji.component'

const routes: Routes = [
  {
    path: '',
    component: EmojiComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmojiRoutingModule {}
