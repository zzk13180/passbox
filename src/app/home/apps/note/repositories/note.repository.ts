import { Inject, Injectable } from '@angular/core'
import { LocalStorage, ElectronService } from 'src/app/services'
import { Note } from '../models'

@Injectable({
  providedIn: 'root',
})
export class NoteRepository {
  readonly noteTabsKey = 'noteTabs'
  private dirPath: string

  constructor(
    @Inject(LocalStorage) private storage: Storage,
    private electronService: ElectronService,
  ) {}

  getNoteTabs(): Note[] {
    const notes = JSON.parse(this.storage.getItem(this.noteTabsKey))
    return notes || []
  }

  setNoteTabs(notes: Note[]): void {
    const noteTabs: Note[] = notes.map(note => {
      return {
        id: note.id,
        title: note.title,
        content: '',
        createdAt: note.createdAt,
      }
    })
    this.storage.setItem(this.noteTabsKey, JSON.stringify(noteTabs))
  }

  async addNewNote(note: Note) {
    await this.ensureDirPath()
    this.electronService.writeFile(`${this.dirPath}${note.id}`, note.content)
  }

  async getNoteContentById(id: string): Promise<string> {
    await this.ensureDirPath()
    const content = await this.electronService.readFile(`${this.dirPath}${id}`)
    return content
  }

  async deleteNoteById(id: string) {
    await this.ensureDirPath()
    this.electronService.deleteFile(`${this.dirPath}${id}`)
  }

  async updateNoteContent(note: Note) {
    await this.ensureDirPath()
    this.electronService.writeFile(`${this.dirPath}${note.id}`, note.content)
  }

  private async ensureDirPath(): Promise<void> {
    if (!this.dirPath) {
      this.dirPath = await this.getDirPath()
    }
  }

  private async getDirPath(): Promise<string> {
    const dataPath = await this.electronService.getUserDataPath()
    const appInfoStr = await this.electronService.getAppInfo()
    const appInfo = JSON.parse(appInfoStr)
    const reg = new RegExp(`${appInfo.name}.json$`)
    return dataPath.replace(reg, '')
  }
}
