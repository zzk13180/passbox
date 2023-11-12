import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core'
import { FormGroup, FormArray, FormControl } from '@angular/forms'
import { StyleRenderer } from '@alyle/ui'
import { LyDialogRef } from '@alyle/ui/dialog'
import Swiper from 'swiper'
import { EffectCube, EffectCoverflow } from 'swiper/modules'
import { Store } from '@ngrx/store'
import { CommandEnum } from 'src/app/enums'
import {
  selectTheSettings,
  updateMainWinAlwaysOnTop,
  updateBrowserWinAlwaysOnTop,
  updateNeedRecordVersions,
} from 'src/app/services'
import { I18nText } from './settings.i18n'
import type { SettingsState } from 'src/app/models'

interface CheckboxTask {
  label: () => string // TODO
  completed: boolean
  onChange: (completed: boolean) => void
}

interface SliderTask {
  name: string
  value: number
  min: number
  max: number
  step: number
  marks: { value: number; label: string }[]
  onChange: (value: number) => void
}

interface KeyboardShortcut {
  name: string
  key: string
  command: CommandEnum
  onChange: (item: KeyboardShortcut) => void
}

@Component({
  selector: 'dialog-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['./settings.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [I18nText],
})
export class SettingsDialog implements OnInit, OnDestroy, AfterViewInit {
  readonly labels = ['Settings', 'Keyboard shortcuts']
  activeIndex: number
  swiper: Swiper

  checkboxTasks: CheckboxTask[] = [
    {
      label: () => this.i18nText.mainWinAlwaysOnTopLabel,
      completed: false,
      onChange: completed => {
        console.log('Main window always on top')
        this.store.dispatch(updateMainWinAlwaysOnTop({ mainWinAlwaysOnTop: completed }))
      },
    },
    {
      label: () => 'Open browser window always on top',
      completed: false,
      onChange: completed => {
        this.store.dispatch(
          updateBrowserWinAlwaysOnTop({ browserWinAlwaysOnTop: completed }),
        )
      },
    },
    {
      label: () => 'Do not record historical versions',
      completed: false,
      onChange: completed => {
        this.store.dispatch(updateNeedRecordVersions({ needRecordVersions: !completed }))
      },
    },
  ]

  sliderTasks: SliderTask[] = [
    {
      name: 'Password encryption strength',
      value: 1,
      min: 1,
      max: 10,
      step: 2,
      marks: [],
      onChange: value => {
        console.log(value)
      },
    },
  ]

  KeyboardShortcuts: KeyboardShortcut[] = [
    {
      name: 'Open main window',
      key: 'Ctrl + Alt + A',
      command: CommandEnum.OpenMainWindow,
      onChange: item => {
        console.log(item)
      },
    },
    {
      name: 'Open settings dialog',
      key: 'Ctrl + S',
      command: CommandEnum.OpenSettingsDialog,
      onChange: item => {
        console.log(item)
      },
    },
    {
      name: 'Open add dialog',
      key: 'Ctrl + D',
      command: CommandEnum.OpenCardAddDialog,
      onChange: item => {
        console.log(item)
      },
    },
  ]

  form = new FormGroup({
    keyboardShortcuts: new FormArray([new FormControl(''), new FormControl('')]),
  })

  get kbsFormArray(): FormArray {
    return this.form.get('keyboardShortcuts') as FormArray
  }

  @ViewChild('swiperContainer') swiperContainer: ElementRef<HTMLDivElement>

  // eslint-disable-next-line max-params
  constructor(
    public i18nText: I18nText,
    public dialogRef: LyDialogRef,
    readonly sRenderer: StyleRenderer,
    private _cd: ChangeDetectorRef,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.activeIndex = 1
    Promise.resolve(true).then(() => (this.activeIndex = 0))
    this.store.select(selectTheSettings).subscribe((settings: SettingsState) => {
      const {
        mainWinAlwaysOnTop,
        browserWinAlwaysOnTop,
        needRecordVersions,
        currentLang,
      } = settings
      this.checkboxTasks[0].completed = mainWinAlwaysOnTop
      this.checkboxTasks[1].completed = browserWinAlwaysOnTop
      this.checkboxTasks[2].completed = !needRecordVersions
      console.log(currentLang)
      this.i18nText.currentLanguage = currentLang
      this._cd.markForCheck()
    })
  }

  ngAfterViewInit() {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [EffectCube, EffectCoverflow],
      effect: 'coverflow',
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      coverflowEffect: {
        slideShadows: false,
        stretch: -300,
      },
    })
    this.swiper.slideTo(0)
    this.swiper.on('slideChange', () => {
      this.activeIndex = this.swiper.activeIndex
      this._cd.markForCheck()
    })
  }

  next(step: number) {
    this.swiper.slideTo(step, 500)
  }

  ngOnDestroy() {
    this.swiper.destroy()
  }

  showTutorialDialog() {
    // TODO: user settings
    const event = new KeyboardEvent('keydown', {
      key: 't',
      ctrlKey: true,
    })
    window.dispatchEvent(event)
  }
}
