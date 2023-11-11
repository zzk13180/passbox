import { NgModule } from '@angular/core'
import { SharedModule } from 'src/app/shared/shared.module'
import { TodoStore } from './apps-todo-store'
import { TodoRoutingModule } from './todo-routing.module'
import { TodoComponent } from './todo.component'

@NgModule({
  declarations: [TodoComponent],
  imports: [TodoRoutingModule, SharedModule],
  providers: [TodoStore],
})
export class TodoModule {}
