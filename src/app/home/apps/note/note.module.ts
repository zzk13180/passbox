import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { LyButtonModule } from '@alyle/ui/button'
import { MatTabsModule } from '@angular/material/tabs'
import { MatDialogModule } from '@angular/material/dialog'
import { LyIconModule } from 'src/app/icon'
import { NoteRoutingModule } from './note-routing.module'
import { NoteEditorComponent } from './components/note-editor/note-editor.component'
import { ToolbarComponent } from './components/toolbar/toolbar.component'

import { NoteRootComponent } from './note.component'
import { HomeComponent } from './pages/home/home.component'
import { ListComponent } from './pages/list/list.component'

@NgModule({
  declarations: [
    NoteEditorComponent,
    ToolbarComponent,
    NoteRootComponent,
    HomeComponent,
    ListComponent,
  ],
  imports: [
    CommonModule,
    NoteRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    LyButtonModule,
    LyIconModule.forRoot(),
    MatDialogModule,
  ],
})
export class NoteModule {}
