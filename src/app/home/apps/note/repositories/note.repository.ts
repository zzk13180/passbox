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
  ) {
    this.setDirPath()
  }

  // localStorage
  getNoteTabs(): Note[] {
    const notes = JSON.parse(this.storage.getItem(this.noteTabsKey))
    return notes || []
  }

  // localStorage
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

  // file system only store note content
  addNewNote(note: Note): void {
    this.electronService.writeFile(`${this.dirPath}${note.id}`, note.content)
  }

  // file system
  async getNoteContentById(id: string): Promise<string> {
    const content = await this.electronService.readFile(`${this.dirPath}${id}`)
    return content
  }

  // file system
  deleteNoteById(id: string): void {
    this.electronService.deleteFile(`${this.dirPath}${id}`)
  }

  // file system
  updateNoteContent(note: Note): void {
    this.electronService.writeFile(`${this.dirPath}${note.id}`, note.content)
  }

  private async setDirPath(): Promise<void> {
    const dataPath = await this.electronService.getUserDataPath()
    const appInfoStr = await this.electronService.getAppInfo()
    const appInfo = JSON.parse(appInfoStr)
    const reg = new RegExp(`${appInfo.name}.json$`)
    this.dirPath = dataPath.replace(reg, '')
  }
}
