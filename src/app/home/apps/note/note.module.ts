import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { QuillModule } from 'ngx-quill'

import { MaterialModule } from 'src/app/material'

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
    MaterialModule.forRoot(),
    QuillModule.forRoot(),
  ],
})
export class NoteModule {}
