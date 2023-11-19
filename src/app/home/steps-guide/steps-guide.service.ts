/* Original code: ng-devui/steps-guide/steps-guide.service.ts */
import { Injectable } from '@angular/core'
import { BehaviorSubject, ReplaySubject } from 'rxjs'

@Injectable()
export class StepsGuideService {
  private showGuideSource = new ReplaySubject<any>(1)
  private currentIndexSource = new BehaviorSubject(0)
  showGuideObs = this.showGuideSource.asObservable()
  currentIndex = this.currentIndexSource.asObservable()

  private steps = []
  private currentStep = 0

  showGuide(visible: boolean) {
    this.showGuideSource.next(visible)
  }

  setCurrentIndex(index: number) {
    this.currentStep = index
    this.currentIndexSource.next(index)
  }

  getCurrentStep() {
    return this.currentStep
  }

  setSteps(steps) {
    this.steps = steps
  }

  getSteps() {
    return this.steps
  }
}
