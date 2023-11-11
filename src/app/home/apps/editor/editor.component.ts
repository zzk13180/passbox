import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core'

@Component({
  selector: 'apps-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnDestroy, AfterViewInit {
  ngAfterViewInit() {
    console.log('ngAfterViewInit')
  }

  ngOnDestroy() {
    console.log('ngOnDestroy')
  }
}
