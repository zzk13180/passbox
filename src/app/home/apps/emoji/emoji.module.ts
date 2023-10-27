import { NgModule } from '@angular/core'
import { LyCommonModule } from '@alyle/ui'
import { LySliderModule } from '@alyle/ui/slider'
import { LySkeletonModule } from '@alyle/ui/skeleton'
import { SharedModule } from 'src/app/shared/shared.module'
import { SearchEmojiComponent } from './search-emoji.component'
import { EmojiRoutingModule } from './emoji-routing.module'
import { EmojiComponent } from './emoji.component'

@NgModule({
  declarations: [EmojiComponent, SearchEmojiComponent],
  imports: [
    EmojiRoutingModule,
    LyCommonModule,
    LySliderModule,
    LySkeletonModule,
    SharedModule,
  ],
})
export class EmojiModule {}
