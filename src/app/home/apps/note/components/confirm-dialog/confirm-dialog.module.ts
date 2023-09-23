import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MaterialModule } from 'src/app/material'
import { ConfirmDialogComponent } from './confirm-dialog.component'

@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [CommonModule, FormsModule, MaterialModule.forRoot()],
})
export class ConfirmDialogModule {}
