import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LyCommonModule } from '@alyle/ui'
import { LyButtonModule } from '@alyle/ui/button'
import { LySliderModule } from '@alyle/ui/slider'
import { LyIconModule } from 'src/app/icon'
import { SearchEmojiComponent } from './search-emoji.component'
import { EmojiRoutingModule } from './emoji-routing.module'
import { EmojiComponent } from './emoji.component'

@NgModule({
  declarations: [EmojiComponent, SearchEmojiComponent],
  imports: [
    EmojiRoutingModule,
    LyCommonModule,
    CommonModule,
    LyIconModule,
    LyButtonModule,
    LySliderModule,
  ],
})
export class EmojiModule {}
