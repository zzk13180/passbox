import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  NgZone,
} from '@angular/core'
import { Subject, takeUntil, debounceTime } from 'rxjs'
import { ElectronService } from 'src/app/services'
import { EditorService } from './editor.service'
import type { OutputData } from '@editorjs/editorjs'

@Component({
  selector: 'apps-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [EditorService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly KEY = 'editor'
  private readonly SAVE_DELAY = 1000 * 1
  private readonly destroy$ = new Subject<void>()
  private path: string
  private cache: string

  constructor(
    private ngZone: NgZone,
    private editorService: EditorService,
    private electronService: ElectronService,
  ) {}

  ngOnInit() {
    this.ngZone.onStable
      .pipe(takeUntil(this.destroy$), debounceTime(this.SAVE_DELAY))
      .subscribe(() => this.save())
  }

  async ngAfterViewInit() {
    await this.ensurePath()
    const data = await this.electronService.readFile(this.path)
    if (!data) {
      return
    }
    await this.editorService.editor.isReady
    try {
      const content: OutputData = JSON.parse(data)
      if (content.blocks?.length) {
        this.editorService.editor.render(content)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async save() {
    try {
      await this.ensurePath()
      const content: OutputData = await this.editorService.editor?.save()
      if (content) {
        const string = JSON.stringify(content)
        if (string === this.cache) {
          return
        }
        this.electronService.writeFile(this.path, string)
        this.cache = string
      }
    } catch (error) {
      console.error(error)
    }
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.save()
    this.editorService.editor?.destroy()
  }

  private async ensurePath(): Promise<void> {
    this.path ??= `${await this.getDirPath()}${this.KEY}.json`
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
