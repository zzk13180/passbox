import { Injectable } from '@angular/core'
import { ElectronService } from 'src/app/services'

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

@Injectable()
export class TodoStore {
  readonly KEY = 'todolist'
  private path: string
  todos: Array<Todo> = []

  constructor(private electronService: ElectronService) {}

  async load() {
    await this.ensurePath()
    const str = await this.electronService.readFile(this.path)
    const persistedTodos = JSON.parse(str || '[]')
    this.todos = persistedTodos.map((todo: { _title: String; completed: boolean }) => {
      const ret = new Todo(todo._title)
      ret.completed = todo.completed as boolean
      return ret
    })
  }

  private async updateStore() {
    await this.ensurePath()
    this.electronService.writeFile(this.path, JSON.stringify(this.todos))
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

  edit() {
    this.updateStore()
  }

  private async ensurePath(): Promise<void> {
    this.path ??= await this.getPath()
  }

  private async getPath(): Promise<string> {
    const { platform } = window.electronAPI.process
    const isWin = platform === 'win32'
    const separator = isWin ? '\\' : '/'
    const dataPath = await this.electronService.getUserDataPath()
    const appInfo = await this.electronService.getAppInfo()
    const reg = new RegExp(`${appInfo.name}.json$`)
    return dataPath.replace(reg, `${this.KEY}${separator}${this.KEY}.json`)
  }
}
