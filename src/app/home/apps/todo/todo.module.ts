import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LyIconModule } from 'src/app/icon'
import { LyButtonModule } from '@alyle/ui/button'
import { TodoRoutingModule } from './todo-routing.module'
import { TodoComponent } from './todo.component'

@NgModule({
  declarations: [TodoComponent],
  imports: [CommonModule, LyIconModule, LyButtonModule, TodoRoutingModule],
})
export class TodoModule {}
