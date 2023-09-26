import { NgModule, ModuleWithProviders } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatTabsModule } from '@angular/material/tabs'
import { MatDialogModule } from '@angular/material/dialog'

@NgModule({
  declarations: [],
  imports: [MatButtonModule, MatIconModule, MatTabsModule, MatDialogModule],
  exports: [MatButtonModule, MatIconModule, MatTabsModule, MatDialogModule],
})
export class MaterialModule {
  static forRoot(): ModuleWithProviders<MaterialModule> {
    return {
      ngModule: MaterialModule,
      providers: [],
    }
  }
}
