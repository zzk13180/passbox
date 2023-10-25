import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  HostListener,
} from '@angular/core'
import { fromEvent, Subject } from 'rxjs'
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators'

@Component({
  selector: 'search',
  template: `<input
    #filterInput
    class=" {{ cssClass }}"
    [placeholder]="placeholder"
    type="text"
  />`,
  exportAs: 'search',
  styleUrls: ['./emoji.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent implements OnDestroy, AfterViewInit {
  @Input() cssClass: string
  @Input() placeholder = '搜索'
  @Input() isKeyupSearch = true
  @Input() delay = 300
  @Input() disabled = false
  @Output() searchFn = new EventEmitter<string>()
  @ViewChild('filterInput', { static: true }) filterInputElement: ElementRef
  destroy$ = new Subject()

  constructor() {}

  @HostListener('window:keydown.meta.f')
  @HostListener('window:keydown.control.f')
  inputfocus() {
    this.filterInputElement.nativeElement.focus()
  }

  registerFilterChange() {
    fromEvent(this.filterInputElement.nativeElement, 'input')
      .pipe(
        takeUntil(this.destroy$),
        map((e: any) => e.target.value),
        debounceTime(this.delay),
      )
      .subscribe(value => {
        if (this.isKeyupSearch) {
          this.searchFn.emit(value)
        }
      })

    fromEvent(this.filterInputElement.nativeElement, 'keydown')
      .pipe(
        takeUntil(this.destroy$),
        filter((keyEvent: KeyboardEvent) => keyEvent.key === 'Enter'),
        debounceTime(this.delay),
      )
      .subscribe(_keyEvent => {
        this.searchFn.emit(this.filterInputElement.nativeElement.value)
      })
  }

  ngAfterViewInit() {
    this.registerFilterChange()
  }

  ngOnDestroy() {
    this.destroy$.next(true)
  }
}
