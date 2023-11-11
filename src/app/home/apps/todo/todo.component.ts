import {
  Component,
  ElementRef,
  ViewChild,
  Renderer2,
  OnDestroy,
  AfterViewInit,
  HostListener,
} from '@angular/core'
import { fromEvent, Subject } from 'rxjs'
import { debounceTime, filter, takeUntil } from 'rxjs/operators'
import { TodoStore } from './apps-todo-store'
import type { Todo } from './apps-todo-store'

@Component({
  selector: 'apps-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements OnDestroy, AfterViewInit {
  readonly delay = 100
  @ViewChild('newTodoInput', { static: true }) newTodoInputElement: ElementRef
  destroy$ = new Subject()

  constructor(
    public todoStore: TodoStore,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit() {
    this.todoStore.load()
    this.renderer.selectRootElement(this.newTodoInputElement.nativeElement).focus()
    fromEvent(this.newTodoInputElement.nativeElement, 'keypress')
      .pipe(
        takeUntil(this.destroy$),
        filter((keyEvent: KeyboardEvent) => {
          return (
            (keyEvent.shiftKey && keyEvent.key === 'Enter') || keyEvent.key === 'Enter'
          )
        }),
        debounceTime(this.delay),
      )
      .subscribe(_keyEvent => {
        const newTodo = this.newTodoInputElement.nativeElement.value.trim()
        newTodo && this.todoStore.add(newTodo)
        this.renderer.setProperty(this.newTodoInputElement.nativeElement, 'value', '')
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
    } else {
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

  @HostListener('window:keydown.meta.d')
  @HostListener('window:keydown.control.d')
  inputfocus() {
    this.newTodoInputElement.nativeElement.focus()
  }

  ngOnDestroy() {
    this.destroy$.next(true)
  }
}
