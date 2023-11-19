/* Original code: ng-devui/steps-guide/steps-guide.types.ts */
export type StepsGuidePositionType =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right'

export interface StepItem {
  title: string
  content: string
}

export interface GuideOptions {
  triggerElement: HTMLElement
  pageName: string
  title: string
  content: string
  stepsCount: number
  stepIndex: number
  position: StepsGuidePositionType
  leftFix: number
  topFix: number
  scrollElement?: Element
  zIndex?: number
}

export interface ExtraConfig {
  hidePreStep: boolean
  hideStepNav: boolean
}

export interface OperateResponse {
  currentIndex: number
  clickType: 'prev' | 'next' | 'close'
}
