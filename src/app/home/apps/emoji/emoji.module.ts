import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LyCommonModule } from '@alyle/ui'
import { LyButtonModule } from '@alyle/ui/button'
import { LyIconModule } from 'src/app/icon'
import { EmojiRoutingModule } from './emoji-routing.module'
import { EmojiComponent } from './emoji.component'

@NgModule({
  declarations: [EmojiComponent],
  imports: [
    EmojiRoutingModule,
    LyCommonModule,
    CommonModule,
    LyIconModule,
    LyButtonModule,
  ],
})
export class EmojiModule {}
