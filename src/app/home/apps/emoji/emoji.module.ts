import { NgModule } from '@angular/core'
import { EmojiRoutingModule } from './emoji-routing.module'
import { EmojiComponent } from './emoji.component'

@NgModule({
  declarations: [EmojiComponent],
  imports: [EmojiRoutingModule],
})
export class EmojiModule {}
