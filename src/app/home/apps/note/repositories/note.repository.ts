import { Inject, Injectable } from '@angular/core'
import { LocalStorage, ElectronService } from 'src/app/services'
import { Note } from '../models'

@Injectable({
  providedIn: 'root',
})
export class NoteRepository {
  readonly KEY = 'notes'
  private dirPath: string

  constructor(
    @Inject(LocalStorage) private storage: Storage,
    private electronService: ElectronService,
  ) {}

  getNoteTabs(): Note[] {
    const notes = JSON.parse(this.storage.getItem(this.KEY) || '[]')
    return notes
  }

  setNoteTabs(notes: Note[]): void {
    const noteTabs = notes.map(({ id, title, createdAt }) => ({
      id,
      title,
      content: '', // keep content empty
      createdAt,
    }))
    this.storage.setItem(this.KEY, JSON.stringify(noteTabs))
  }

  async addNewNote(note: Note) {
    await this.ensureDirPath()
    this.electronService.writeFile(`${this.dirPath}${note.id}.json`, note.content)
  }

  async getNoteContentById(id: string): Promise<string> {
    await this.ensureDirPath()
    const content = await this.electronService.readFile(`${this.dirPath}${id}.json`)
    return content
  }

  async deleteNoteById(id: string) {
    await this.ensureDirPath()
    this.electronService.deleteFile(`${this.dirPath}${id}.json`)
  }

  async updateNoteContent(note: Note) {
    await this.ensureDirPath()
    this.electronService.writeFile(`${this.dirPath}${note.id}.json`, note.content)
  }

  private async ensureDirPath(): Promise<void> {
    this.dirPath ??= await this.getDirPath()
  }

  private async getDirPath(): Promise<string> {
    const { platform } = window.electronAPI.process
    const isWin = platform === 'win32'
    const separator = isWin ? '\\' : '/'
    const dataPath = await this.electronService.getUserDataPath()
    const appInfo = await this.electronService.getAppInfo()
    const reg = new RegExp(`${appInfo.name}.json$`)
    return dataPath.replace(reg, `${this.KEY}${separator}`)
  }
}
