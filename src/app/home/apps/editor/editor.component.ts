import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { ElectronService } from 'src/app/services'
import { EditorService } from './editor.service'

@Component({
  selector: 'apps-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [EditorService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly KEY = 'editor'
  private path: string
  constructor(
    private editorService: EditorService,
    private electronService: ElectronService,
  ) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    try {
      await this.ensurePath()
      const data = await this.electronService.readFile(this.path)
      await this.editorService.editor.isReady
      const content = JSON.parse(data)
      if (content.blocks?.length) {
        this.editorService.editor.render(content)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async ngOnDestroy() {
    try {
      await this.ensurePath()
      const data = await this.editorService.editor.save()
      this.electronService.writeFile(this.path, JSON.stringify(data))
    } catch (error) {
      console.error(error)
    }
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
