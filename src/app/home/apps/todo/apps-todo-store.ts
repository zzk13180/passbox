import { Inject, Injectable } from '@angular/core'
import { LocalStorage } from 'src/app/services'

export class Todo {
  private _title: String
  completed: boolean
  editing: boolean

  get title() {
    return this._title
  }

  set title(value: String) {
    this._title = value.trim()
  }

  constructor(title: String) {
    this.completed = false
    this.editing = false
    this.title = title.trim()
  }
}

@Injectable({
  providedIn: 'root',
})
export class TodoStore {
  readonly storageKey = 'apps-todo'
  todos: Array<Todo>

  constructor(@Inject(LocalStorage) private storage: Storage) {
    const persistedTodos = JSON.parse(this.storage.getItem(this.storageKey) || '[]')
    // Normalize back into classes
    this.todos = persistedTodos.map((todo: { _title: String; completed: boolean }) => {
      const ret = new Todo(todo._title)
      ret.completed = todo.completed as boolean
      return ret
    })
  }

  private updateStore() {
    this.storage.setItem(this.storageKey, JSON.stringify(this.todos))
  }

  private getWithCompleted(completed: boolean) {
    return this.todos.filter((todo: Todo) => todo.completed === completed)
  }

  allCompleted() {
    return this.todos.length === this.getCompleted().length
  }

  setAllTo(completed: boolean) {
    this.todos.forEach((t: Todo) => (t.completed = completed))
    this.updateStore()
  }

  removeCompleted() {
    this.todos = this.getWithCompleted(false)
    this.updateStore()
  }

  getRemaining() {
    return this.getWithCompleted(false)
  }

  getCompleted() {
    return this.getWithCompleted(true)
  }

  toggleCompletion(todo: Todo) {
    todo.completed = !todo.completed
    this.updateStore()
  }

  remove(todo: Todo) {
    this.todos.splice(this.todos.indexOf(todo), 1)
    this.updateStore()
  }

  add(title: String) {
    this.todos.push(new Todo(title))
    this.updateStore()
  }
}
