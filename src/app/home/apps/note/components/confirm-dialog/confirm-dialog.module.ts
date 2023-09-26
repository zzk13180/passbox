import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { ConfirmDialogComponent } from './confirm-dialog.component'

@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [CommonModule, FormsModule, MatFormFieldModule],
})
export class ConfirmDialogModule {}
