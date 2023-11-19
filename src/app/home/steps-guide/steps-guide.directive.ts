/* Original code: ng-devui/steps-guide/steps-guide.directive.ts */
/* eslint-disable max-params */
/* eslint-disable no-useless-return */
/* eslint-disable lines-between-class-members */
import { DOCUMENT } from '@angular/common'
import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { LocalStorage } from 'src/app/services'
import { OverlayContainerRef } from './overlay-container-ref'
import { StepsGuideComponent } from './steps-guide.component'
import { StepsGuideService } from './steps-guide.service'
import {
  ExtraConfig,
  GuideOptions,
  OperateResponse,
  StepItem,
  StepsGuidePositionType,
} from './steps-guide.types'

@Directive({
  selector: '[dStepsGuide]',
})
export class StepsGuideDirective implements OnInit, OnDestroy {
  @Input() pageName: string
  @Input() steps: Array<StepItem> = []
  @Input() stepIndex: number

  private _dStepsGuidePosition: StepsGuidePositionType
  @Input() set dStepsGuidePosition(pos: StepsGuidePositionType) {
    this._dStepsGuidePosition = pos
  }
  get dStepsGuidePosition(): StepsGuidePositionType {
    return this._dStepsGuidePosition || 'top'
  }

  @Input() leftFix = 0
  @Input() topFix = 0
  @Input() zIndex = 1200
  @Input() targetElement: any
  @Input() scrollElement: any
  @Input() scrollToTargetSwitch = true
  @Input() extraConfig: ExtraConfig

  @Input() beforeChange: (
    currentIndex,
    targetIndex,
  ) => boolean | Promise<boolean> | Observable<boolean>
  @Output() operateChange = new EventEmitter<OperateResponse>()
  stepRef: ComponentRef<StepsGuideComponent>
  observer: any
  toggle: any
  currentIndex: number
  sub: Subscription = new Subscription()
  MUTATION_OBSERVER_CONFIG = { attributes: true, subtree: true }
  MUTATION_OBSERVER_TIME = 500
  document: Document

  constructor(
    private stepService: StepsGuideService,
    private elm: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private overlayContainerRef: OverlayContainerRef,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(LocalStorage) private storage: Storage,
  ) {
    this.document = this.doc
  }

  ngOnInit() {
    this.sub.add(
      this.stepService.currentIndex.subscribe(index => {
        this.canChange(index).then(change => {
          if (!change) {
            return
          }
        })
        const serviceSteps = this.stepService.getSteps() || []
        this.steps = serviceSteps.length > 0 ? serviceSteps : this.steps
        const state = this.storage.getItem(`devui_guide_${this.pageName}`) || '1'
        this.toggle = Number(state)
        this.currentIndex = index
        const currentStep = this.steps.length > 0 && this.steps[this.currentIndex]
        if (currentStep && this.toggle && this.stepIndex === this.currentIndex) {
          const targetDom = this.targetElement || this.elm.nativeElement
          if (this.scrollToTargetSwitch) {
            targetDom.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest',
            })
          }
          setTimeout(() => {
            this.insert({
              triggerElement: targetDom,
              scrollElement: this.scrollElement,
              pageName: this.pageName,
              title: currentStep.title,
              content: currentStep.content,
              stepsCount: this.steps.length,
              stepIndex: this.stepIndex,
              position: this.dStepsGuidePosition,
              leftFix: this.leftFix,
              topFix: this.topFix,
              zIndex: this.zIndex,
            })
          })
        }
      }),
    )

    this.sub.add(
      this.stepService.showGuideObs.subscribe(visible => {
        if (visible) {
          const currentIndex = this.stepService.getCurrentStep() || 0
          this.storage.removeItem(`devui_guide_${this.pageName}`)
          this.stepService.setCurrentIndex(currentIndex)
        } else {
          this.storage.setItem(`devui_guide_${this.pageName}`, '0')
          this.destroyView()
        }
      }),
    )
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
    this.destroyView()
  }

  destroyView() {
    if (this.stepRef) {
      this.stepRef.hostView.destroy()
    }
    this.destroyMutationObserver()
  }

  insert(option: GuideOptions) {
    const hasGuide = this.document.querySelector('body>.devui-step-item')
    if (!hasGuide) {
      this.stepRef = this.overlayContainerRef.createComponent(
        this.componentFactoryResolver.resolveComponentFactory(StepsGuideComponent),
      )
      Object.assign(this.stepRef.instance, option, { extraConfig: this.extraConfig })
      this.stepRef.instance.close = (step, type?) => {
        this.operateChange.emit({ clickType: type, currentIndex: step })
        this.destroyView()
      }
    }
  }

  destroyMutationObserver(destroyAll?: boolean) {
    if (this.observer) {
      this.observer.disconnect()
    }
    if (destroyAll) {
      this.observer = undefined
    }
  }

  canChange(index) {
    let changeResult = Promise.resolve(true)
    const currentIndex = this.currentIndex >= 0 ? this.currentIndex : this.stepIndex
    if (currentIndex === index && this.beforeChange) {
      const result: any = this.beforeChange(currentIndex, index)
      if (typeof result !== 'undefined') {
        if (result.then) {
          changeResult = result
        } else if (result.subscribe) {
          changeResult = (result as Observable<boolean>).toPromise()
        } else {
          changeResult = Promise.resolve(result)
        }
      }
    }
    return changeResult
  }
}
