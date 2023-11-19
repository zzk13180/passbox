/* eslint-disable operator-assignment */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-params */
import { DOCUMENT } from '@angular/common'
import {
  AfterViewInit,
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core'
import { fromEvent, Subscription } from 'rxjs'
import { debounceTime, throttleTime } from 'rxjs/operators'
import { LocalStorage } from 'src/app/services'
import { PositionService } from './position.service'
import { StepsGuideService } from './steps-guide.service'
import { ExtraConfig } from './steps-guide.types'
import { PartyService } from './party.service'

@Component({
  templateUrl: './steps-guide.component.html',
  styleUrls: ['./steps-guide.component.scss'],
  preserveWhitespaces: false,
})
export class StepsGuideComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('partyEL') partyEL: ElementRef
  @HostBinding('class')
  get class() {
    return `devui-step-item ${this.position}`
  }

  @HostBinding('style.display')
  get display() {
    return 'block'
  }

  triggerElement: HTMLElement
  scrollElement: HTMLElement
  pageName: string
  title: string
  content: string
  stepsCount: number
  stepIndex: number
  position = 'top'
  leftFix: number
  topFix: number
  zIndex = 1200
  extraConfig: ExtraConfig
  dots: Array<undefined> = []
  subScriber: Subscription
  SCROLL_REFRESH_INTERVAL = 100
  DOT_HORIZONTAL_MARGIN = 27
  DOT_VERTICAL_MARGIN = 22
  document: Document

  private party: any
  constructor(
    private stepService: StepsGuideService,
    private renderer: Renderer2,
    private positionService: PositionService,
    private elm: ElementRef,
    private ngZone: NgZone,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(LocalStorage) private storage: Storage,
    private partyService: PartyService,
  ) {
    this.document = this.doc
  }

  ngOnInit() {
    this.dots = new Array(this.stepsCount)
    this.elm.nativeElement.style.zIndex = this.zIndex
    this.subScriber = fromEvent(this.document.defaultView, 'resize')
      .pipe(debounceTime(this.SCROLL_REFRESH_INTERVAL))
      .subscribe(() => {
        this.updatePosition()
      })
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(async () => {
      this.party = await this.partyService.getParty()
      this.party.sparkles(this.partyEL.nativeElement, {
        size: 1,
        count: 15,
        speed: 30,
      })
    })
    this.updatePosition()
    if (!this.scrollElement) {
      const currentScrollElement = this.positionService.getScrollParent(
        this.triggerElement,
      )
      this.scrollElement =
        currentScrollElement === this.document.body
          ? this.document.defaultView
          : currentScrollElement
    }
    const scrollSubscriber = fromEvent(this.scrollElement, 'scroll')
      .pipe(
        throttleTime(this.SCROLL_REFRESH_INTERVAL, undefined, {
          leading: true,
          trailing: true,
        }),
      )
      .subscribe(() => {
        this.updatePosition()
      })
    this.subScriber.add(scrollSubscriber)
  }

  ngOnDestroy() {
    this.party = null
    if (this.subScriber) {
      this.subScriber.unsubscribe()
    }
  }

  updatePosition() {
    const calcPosition =
      this.position === 'left'
        ? 'left-top'
        : this.position === 'right'
          ? 'right-top'
          : this.position
    const rect = this.positionService.positionElements(
      this.triggerElement,
      this.elm.nativeElement,
      calcPosition,
      true,
    )
    const targetRect = this.triggerElement.getBoundingClientRect()
    let left = rect.left
    let top = rect.top

    switch (rect.placementPrimary) {
      case 'top':
        left =
          targetRect.left +
          this.triggerElement.clientWidth / 2 -
          this.elm.nativeElement.clientWidth / 2
        top = top + this.triggerElement.clientHeight / 2 - this.DOT_HORIZONTAL_MARGIN
        break
      case 'bottom':
        left =
          targetRect.left +
          this.triggerElement.clientWidth / 2 -
          this.elm.nativeElement.clientWidth / 2
        top = top + this.DOT_HORIZONTAL_MARGIN / 2
        break
      case 'left':
        left = left + this.triggerElement.clientWidth / 2 - this.DOT_HORIZONTAL_MARGIN
        top = top + this.triggerElement.clientHeight / 2 - this.DOT_VERTICAL_MARGIN
        break
      case 'right':
        left = left - this.triggerElement.clientWidth / 2 + this.DOT_HORIZONTAL_MARGIN
        top = top + this.triggerElement.clientHeight / 2 - this.DOT_VERTICAL_MARGIN
        break
      default:
    }

    switch (rect.placementSecondary) {
      case 'left':
        left = targetRect.left
        break
      case 'right':
        left =
          targetRect.left -
          this.elm.nativeElement.clientWidth +
          this.triggerElement.clientWidth
        break
      default:
    }

    this.renderer.setStyle(this.elm.nativeElement, 'left', `${left}px`)
    this.renderer.setStyle(this.elm.nativeElement, 'top', `${top}px`)

    if (this.leftFix) {
      this.renderer.setStyle(this.elm.nativeElement, 'marginLeft', `${this.leftFix}px`)
    }
    if (this.topFix) {
      this.renderer.setStyle(this.elm.nativeElement, 'marginTop', `${this.topFix}px`)
    }
  }

  next() {
    const newStep =
      (this.stepIndex + 1 < this.stepsCount && this.stepIndex + 1) || this.stepsCount - 1
    this.stepService.setCurrentIndex(newStep)
    this.close(newStep, 'next')
  }

  prev() {
    const newStep = (this.stepIndex - 1 > 0 && this.stepIndex - 1) || 0
    this.stepService.setCurrentIndex(newStep)
    this.close(newStep, 'prev')
  }

  closeAll() {
    this.storage.setItem(`devui_guide_${this.pageName}`, '0')
    this.close(this.stepService.getCurrentStep(), 'close')
  }

  close(_step, _type?) {}
}
