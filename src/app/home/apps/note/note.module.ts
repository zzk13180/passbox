import { NgModule } from '@angular/core'
import { MatTabsModule } from '@angular/material/tabs'
import { MatDialogModule } from '@angular/material/dialog'
import { SharedModule } from 'src/app/shared/shared.module'

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
  imports: [SharedModule, NoteRoutingModule, MatTabsModule, MatDialogModule],
})
export class NoteModule {}
