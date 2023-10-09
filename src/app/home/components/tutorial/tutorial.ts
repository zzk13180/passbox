import { Component, OnInit } from '@angular/core'
import { LyDialogRef } from '@alyle/ui/dialog'
import Swiper from 'swiper'
import { EffectCube, EffectCoverflow } from 'swiper/modules'

@Component({
  selector: 'dialog-tutorial',
  templateUrl: 'tutorial.html',
  styleUrls: ['./tutorial.scss'],
})
export class TutorialDialog implements OnInit {
  constructor(public dialogRef: LyDialogRef) {}

  ngOnInit(): void {
    const el = document.querySelector('.swiper-container')
    const swiper = new Swiper(el as HTMLElement, {
      modules: [EffectCube, EffectCoverflow],
      effect: 'cube',
      createElements: true,
    })
    swiper.slideTo(0)
  }
}
