import {
  Component,
  ElementRef,
  ViewChild,
  Renderer2,
  OnInit,
  OnDestroy,
  AfterViewInit,
  NgZone,
} from '@angular/core'
import { fromEvent, Subject } from 'rxjs'
import { filter, takeUntil } from 'rxjs/operators'
import { CommandListener } from 'src/app/decorator'
import { CommandEnum } from 'src/app/enums'
import { TodoStore } from './apps-todo-store'
import type { Todo } from './apps-todo-store'

@Component({
  selector: 'apps-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('newTodoElement', { static: true }) newTodoElement: ElementRef
  @ViewChild('editedTodoElement', { static: false }) editedTodoElement: ElementRef
  private destroy$ = new Subject()

  constructor(
    public todoStore: TodoStore,
    private renderer: Renderer2,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.todoStore.load()
    this.newTodoElement.nativeElement?.focus()
    fromEvent(this.newTodoElement.nativeElement, 'keypress')
      .pipe(
        takeUntil(this.destroy$),
        filter((keyEvent: KeyboardEvent) => keyEvent.key === 'Enter'),
      )
      .subscribe(_keyEvent => {
        const newTodo = this.newTodoElement.nativeElement.value.trim()
        newTodo && this.todoStore.add(newTodo)
        this.renderer.setProperty(this.newTodoElement.nativeElement, 'value', '')
      })
    this.ngZone.onStable.subscribe(() => {
      this.editedTodoElement?.nativeElement?.focus()
    })
  }

  cancelEditingTodo(todo: Todo) {
    todo.editing = false
  }

  updateEditingTodo(todo: Todo, editedTitle: string) {
    editedTitle = editedTitle.trim()
    todo.editing = false
    if (editedTitle.length === 0) {
      this.todoStore.remove(todo)
    } else if (editedTitle !== todo.title) {
      todo.title = editedTitle
      this.todoStore.edit()
    }
  }

  handleKeyPress(event: KeyboardEvent, todo: Todo, editedTitle: string) {
    if (event.key === 'Enter') {
      this.updateEditingTodo(todo, editedTitle)
    }
  }

  editTodo(todo: Todo) {
    todo.editing = true
  }

  removeCompleted() {
    this.todoStore.removeCompleted()
  }

  toggleCompletion(todo: Todo) {
    this.todoStore.toggleCompletion(todo)
  }

  remove(todo: Todo) {
    this.todoStore.remove(todo)
  }

  @CommandListener(CommandEnum.FocusSearchInput)
  inputfocus() {
    this.newTodoElement.nativeElement.focus()
  }

  ngOnDestroy() {
    this.destroy$.next(true)
  }
}
