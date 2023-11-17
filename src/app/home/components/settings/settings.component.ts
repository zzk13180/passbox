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
import { StyleRenderer, LyClasses } from '@alyle/ui'
import { LyDialogRef } from '@alyle/ui/dialog'
import Swiper from 'swiper'
import { EffectCube, EffectCoverflow } from 'swiper/modules'
import { Store } from '@ngrx/store'
import { take, withLatestFrom } from 'rxjs'
import {
  selectTheSettings,
  updateMainWinAlwaysOnTop,
  updateBrowserWinAlwaysOnTop,
  updateNeedRecordVersions,
  CardsPermissionsService,
  MessageService,
  UserStateService,
  KeyboardShortcutsService,
  selectInitialSettings,
  updateKeyboardShortcutsBindings,
  selectCurrentLanguage,
  CommandService,
} from 'src/app/services'
import { CommandEnum } from 'src/app/enums'
import { I18nText } from './settings.i18n'
import { STYLES } from './STYLES.data'
import type { SettingsState, KeyboardShortcutsBindingItem } from 'src/app/models'

interface CheckboxTask {
  label: keyof I18nText
  completed: boolean
  onChange: (completed: boolean) => void
}

interface SliderTask {
  name: keyof I18nText
  value: number
  min: number
  max: number
  step: number
  marks: { value: number; label: string }[]
  onChange: (value: number) => void
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
  readonly classes: LyClasses<typeof STYLES>
  readonly labels = ['Settings', 'Keyboard shortcuts']
  activeIndex: number = 0
  tabsContentOverflowStyle = 'hidden'
  swiper: Swiper
  origKbs: KeyboardShortcutsBindingItem[]
  form: FormGroup = new FormGroup({
    keyboardShortcuts: new FormArray([]),
  })

  get kbsFormArray(): FormArray {
    return this.form.get('keyboardShortcuts') as FormArray
  }

  checkboxTasks: CheckboxTask[] = [
    {
      label: 'mainWinAlwaysOnTopLabel',
      completed: false,
      onChange: completed => {
        this.store.dispatch(updateMainWinAlwaysOnTop({ mainWinAlwaysOnTop: completed }))
      },
    },
    {
      label: 'openBrowserWinAlwaysOnTopLabel',
      completed: false,
      onChange: completed => {
        this.store.dispatch(
          updateBrowserWinAlwaysOnTop({ browserWinAlwaysOnTop: completed }),
        )
      },
    },
    {
      label: 'doNotRecordHistoricalVersionsLabel',
      completed: false,
      onChange: completed => {
        this.store.dispatch(updateNeedRecordVersions({ needRecordVersions: !completed }))
      },
    },
  ]

  sliderTasks: SliderTask[] = [
    {
      name: 'passwordEncryptionStrengthLabel',
      value: 1,
      min: 1,
      max: 10,
      step: 1,
      marks: [],
      onChange: async value => {
        const strength = value === 1 ? 5000 : value * 10_000
        try {
          await this.cardsPermissionsService.changePasswordEncryptionStrength(strength)
        } catch (error) {
          this.messages.open({
            msg: error.message,
          })
          return
        }
        this.messages.open({
          msg: 'success',
        })
      },
    },
  ]

  @ViewChild('swiperContainer') swiperContainer: ElementRef<HTMLDivElement>

  // eslint-disable-next-line max-params
  constructor(
    public i18nText: I18nText,
    public dialogRef: LyDialogRef,
    readonly sRenderer: StyleRenderer,
    private _cd: ChangeDetectorRef,
    private store: Store,
    private cardsPermissionsService: CardsPermissionsService,
    private messages: MessageService,
    private userStateService: UserStateService,
    private keyboardShortcutsService: KeyboardShortcutsService,
  ) {
    this.classes = this.sRenderer.renderSheet(STYLES, true)
  }

  async ngOnInit() {
    this.activeIndex = 1
    Promise.resolve(true).then(() => (this.activeIndex = 0))
    const { passwordEncryptionStrength: existStrength } =
      await this.userStateService.getUserState()

    this.sliderTasks[0].value = Math.ceil(existStrength / 10_000)

    this.store.select(selectCurrentLanguage).subscribe(language => {
      this.i18nText.currentLanguage = language
      this._cd.markForCheck()
    })

    this.store
      .select(selectTheSettings)
      .pipe(take(1), withLatestFrom(this.store.select(selectInitialSettings)))
      .subscribe(([settings, initSettings]: [SettingsState, SettingsState]) => {
        const { keyboardShortcutsBindings: origKbs } = initSettings
        this.origKbs = origKbs
        const {
          mainWinAlwaysOnTop,
          browserWinAlwaysOnTop,
          needRecordVersions,
          keyboardShortcutsBindings,
        } = settings

        this.checkboxTasks[0].completed = mainWinAlwaysOnTop
        this.checkboxTasks[1].completed = browserWinAlwaysOnTop
        this.checkboxTasks[2].completed = !needRecordVersions

        this.kbsFormArray.clear()
        keyboardShortcutsBindings.forEach(item => {
          const formControl = new FormControl(item.key)
          formControl.valueChanges.subscribe((key: string) => {
            this.store.dispatch(
              updateKeyboardShortcutsBindings({ command: item.command, key }),
            )
          })
          this.kbsFormArray.push(formControl)
        })
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
      this.tabsContentOverflowStyle = this.activeIndex === 0 ? 'hidden' : 'auto'
      try {
        const container = this.swiperContainer.nativeElement.parentNode as HTMLElement
        container.scrollTop = 0
      } catch (_) {}
    })
  }

  next(step: number) {
    this.swiper.slideTo(step, 500)
  }

  ngOnDestroy() {
    this.swiper.destroy()
  }

  showTutorialDialog() {
    CommandService.triggerCommand(CommandEnum.OpenTutorialDialog)
  }

  keyInput(index: number, event: KeyboardEvent) {
    event.preventDefault()
    event.stopPropagation()
    const key = this.keyboardShortcutsService.event2key(event)
    if (key) {
      this.kbsFormArray.controls[index].setValue(key)
    }
  }
}
