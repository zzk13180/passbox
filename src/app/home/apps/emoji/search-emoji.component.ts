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
  OnInit,
} from '@angular/core'
import { fromEvent, Subject } from 'rxjs'
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators'
import { CommandListener } from 'src/app/decorator'
import { CommandEnum } from 'src/app/enums'

@Component({
  selector: 'search-emoji',
  template: `<input
    #filterInput
    class=" {{ cssClass }}"
    [placeholder]="placeholder"
    type="text"
  />`,
  styleUrls: ['./emoji.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchEmojiComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() cssClass: string
  @Input() placeholder = 'search'
  @Input() isKeyupSearch = true
  @Input() delay = 300
  @Input() disabled = false
  @Output() searchFn = new EventEmitter<string>()
  @ViewChild('filterInput', { static: true }) filterInputElement: ElementRef
  destroy$ = new Subject()

  constructor() {}

  ngOnInit() {}

  @CommandListener(CommandEnum.FocusSearchInput)
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
