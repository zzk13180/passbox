import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  NgZone,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core'
import { LyClasses, LyTheme2, StyleRenderer } from '@alyle/ui'
import { LyDialogRef } from '@alyle/ui/dialog'
import Swiper from 'swiper'
import { EffectCube, EffectCoverflow } from 'swiper/modules'
import { createNoise3D } from 'simplex-noise'
import { Store } from '@ngrx/store'
import { updateCurrentLang, selectLanguage } from 'src/app/services/ngrx.service'
import { I18nLanguageEnum } from 'src/app/enums'
import { I18nText } from './tutorial.i18n'
import { STYLES } from './STYLES.data'

@Component({
  selector: 'dialog-tutorial',
  templateUrl: 'tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [I18nText],
})
export class TutorialDialog implements OnInit, OnDestroy, AfterViewInit {
  readonly classes: LyClasses<typeof STYLES>
  i18nEnum = I18nLanguageEnum
  intra: Intra
  @ViewChild('languageBtns') languageBtns: ElementRef
  @ViewChild('swiperContainer') swiperContainer: ElementRef
  swiper: Swiper
  // eslint-disable-next-line max-params
  constructor(
    public i18nText: I18nText,
    public dialogRef: LyDialogRef,
    readonly sRenderer: StyleRenderer,
    private theme: LyTheme2,
    private ngZone: NgZone,
    private store: Store,
    private _cd: ChangeDetectorRef,
  ) {
    this.classes = this.sRenderer.renderSheet(STYLES, 'root')
  }

  ngOnInit(): void {
    this.store.select(selectLanguage).subscribe(language => {
      this.i18nText.currentLanguage = language
      this._cd.markForCheck()
    })
  }

  ngAfterViewInit() {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [EffectCube, EffectCoverflow],
      effect: 'coverflow',
      coverflowEffect: {
        slideShadows: false,
        stretch: -300,
      },
    })
    this.swiper.slideTo(0)
    this.swiper.on('slideChange', () => {
      if (this.intra) {
        this.ngZone.runOutsideAngular(() => {
          this.intra.onWindowResize()
        })
      }
    })
    this.theme.requestAnimationFrame(() => {
      this.intra = new Intra('#1a0e2d', 700, 17, 3000, 0.000009, 9000) // #030722
      this.intra.start()
    })
    try {
      const userLangs = [
        ...new Set(navigator.languages.map(l => l.toLowerCase().split('-')[0])),
      ]
      const btns = this.languageBtns.nativeElement as HTMLDivElement
      const { firstChild } = btns
      userLangs.forEach(lang => {
        const child = btns.querySelector(`#${lang}`)
        child && btns.insertBefore(child, firstChild)
      })
    } catch (_) {}
  }

  ngOnDestroy() {
    if (this.intra) {
      this.intra.stop()
    }
    this.swiper.destroy()
  }

  next(step: number) {
    this.swiper.slideTo(step, 700)
  }

  setLanguage(lang: I18nLanguageEnum) {
    this.store.dispatch(updateCurrentLang({ language: lang }))
  }

  @HostListener('window:resize') _resize$() {
    if (this.intra) {
      this.ngZone.runOutsideAngular(() => {
        this.intra.onWindowResize()
      })
    }
  }
}

export class Intra {
  private fadeTime = 2000 // in ms
  private fadeTimeStart: number

  private canvas: HTMLCanvasElement
  private screenWidth: number
  private screenHeight: number
  private centerX: number
  private centerY: number
  private particles: Particle[] = []
  private hueBase = 0
  private noise3D
  private zoff = 0
  private can2: HTMLCanvasElement
  private ctx2: CanvasRenderingContext2D
  private ctx: CanvasRenderingContext2D
  private requestId?: number
  private timeoutId: any

  // eslint-disable-next-line max-params
  constructor(
    private backgroundColor: string,
    private particleNum: number,
    private step: number,
    private base: number,
    private zInc: number,
    private duration: number,
  ) {}

  start() {
    this.stop()
    this.timeoutId = setTimeout(() => {
      this.stop()
    }, this.duration)
    this.canvas = document.getElementById('bg') as HTMLCanvasElement
    this.can2 = document.createElement('canvas')
    this.ctx = this.can2.getContext('2d')!
    this.ctx2 = this.canvas.getContext('2d')!

    this.updatePosition()

    for (let i = 0, len = this.particleNum; i < len; i++) {
      this.particles[i] = new Particle()
      this.initParticle(this.particles[i])
    }

    this.noise3D = createNoise3D()

    this.requestId = requestAnimationFrame(this.update.bind(this))
    this.ctx.lineWidth = 0.7
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.fillStyle = this.backgroundColor
    this.ctx.fillRect(0, 0, this.screenWidth, this.screenHeight)
  }

  // Event listeners

  onWindowResize() {
    this.updatePosition()
    this.stop()
    this.start()
  }

  private updatePosition() {
    this.can2.width = window.innerWidth
    this.screenWidth = window.innerWidth
    this.canvas.width = window.innerWidth
    this.can2.height = window.innerWidth
    this.screenHeight = window.innerWidth
    this.canvas.height = window.innerHeight
    this.centerX = this.screenWidth / 10
    this.centerY = this.screenHeight / 10
  }

  getNoise(x: number, y: number, z: number) {
    const octaves = 2
    const fallout = 0.5
    let amp = 1
    let f = 1
    let sum = 1

    for (let i = 0; i < octaves; ++i) {
      amp *= fallout
      sum += amp * (this.noise3D(x * f, y * f, z * f) + 1) * 4.4
      f *= 3
    }

    return sum
  }

  initParticle(p: Particle) {
    p.x = this.screenWidth * Math.random()
    p.pastX = this.screenWidth * Math.random()
    p.y = this.screenHeight * Math.random()
    p.pastY = this.screenHeight * Math.random()
    p.color.h =
      this.hueBase + (Math.atan2(this.centerY - p.y, this.centerX - p.x) * 200) / Math.PI
    p.color.s = 1
    p.color.l = 0.6
    p.color.a = 0
  }

  // Update

  update(time: number) {
    const { step } = this
    const { base } = this
    let i: number
    let p: Particle
    let angle: number

    for (i = 0; i < this.particles.length; i++) {
      p = this.particles[i]

      p.pastX = p.x
      p.pastY = p.y

      angle =
        Math.PI * 6 * this.getNoise((p.x / base) * 1.75, (p.y / base) * 1.75, this.zoff)
      p.x += Math.cos(angle) * step
      p.y += Math.sin(angle) * step

      if (p.color.a < 1) {
        p.color.a += 0.001
      }

      this.ctx.beginPath()
      this.ctx.strokeStyle = p.color.toString()
      this.ctx.moveTo(p.pastX, p.pastY)
      this.ctx.lineTo(p.x, p.y)
      this.ctx.stroke()

      if (p.x < 0 || p.x > this.screenWidth || p.y < 0 || p.y > this.screenHeight) {
        this.initParticle(p)
      }
    }

    this.hueBase += 0.4
    this.zoff += this.zInc

    // Code to fade in the view
    if (this.fadeTimeStart === undefined) {
      this.fadeTimeStart = time
    }
    const fTime = (time - this.fadeTimeStart) / this.fadeTime
    if (fTime < 1) {
      this.ctx2.globalAlpha = fTime
      this.ctx2.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx2.drawImage(this.can2, 0, 0)
    } else {
      this.ctx2.globalAlpha = 1
      this.ctx2.drawImage(this.can2, 0, 0)
    }

    this.requestId = requestAnimationFrame(this.update.bind(this))
  }

  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.requestId) {
      cancelAnimationFrame(this.requestId)
      this.requestId = undefined
    }
  }
}

/**
 * HSLA
 */
class HSLA {
  constructor(
    public h = 0,
    public s = 0,
    public l = 0,
    public a = 0,
  ) {}

  toString() {
    return `hsla(${this.h},${this.s * 100}%,${this.l * 100}%,${this.a})`
  }
}

/**
 * Particle
 */
class Particle {
  x: number
  y: number
  color: HSLA
  pastX: number
  pastY: number
  constructor(
    x?: number,
    y?: number,
    color?: { h: number; s: number; l: number; a: number },
  ) {
    this.x = x || 0
    this.y = y || 0
    this.color = color || new HSLA()
  }
}
