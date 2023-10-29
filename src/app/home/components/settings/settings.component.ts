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
import { UntypedFormControl, Validators } from '@angular/forms'
import { StyleRenderer } from '@alyle/ui'
import { LyDialogRef } from '@alyle/ui/dialog'
import Swiper from 'swiper'
import { EffectCube, EffectCoverflow } from 'swiper/modules'
import { I18nText } from './settings.i18n'

@Component({
  selector: 'dialog-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['./settings.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StyleRenderer],
})
export class SettingsDialog implements OnInit, OnDestroy, AfterViewInit {
  readonly labels = ['Settings', 'Keyboard shortcuts']
  activeIndex: number
  swiper: Swiper

  @ViewChild('swiperContainer') swiperContainer: ElementRef

  constructor(
    public i18nText: I18nText,
    public dialogRef: LyDialogRef,
    readonly sRenderer: StyleRenderer,
    private _cb: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.activeIndex = 1
    Promise.resolve(true).then(() => (this.activeIndex = 0))
  }

  ngAfterViewInit() {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [EffectCube, EffectCoverflow],
      effect: 'coverflow',
      createElements: true,
    })
    this.swiper.slideTo(0)
    this.swiper.on('slideChange', () => {
      this.activeIndex = this.swiper.activeIndex
      this._cb.markForCheck()
    })
  }

  next(step: number) {
    this.swiper.slideTo(step, 500)
  }

  ngOnDestroy() {}
}
