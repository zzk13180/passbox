/*🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅
search card 😄
🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅🔅*/
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { fromEvent, Subject } from 'rxjs'
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators'
import { CommandListener } from 'src/app/decorator'
import { CommandEnum } from 'src/app/enums'

@Component({
  selector: 'search-card',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
})
export class SearchComponent
  implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit
{
  @Input() size: '' | 'sm' | 'lg' = ''
  @Input() placeholder = 'search'
  @Input() maxLength = Number.MAX_SAFE_INTEGER
  @Input() isKeyupSearch = true
  @Input() delay = 300
  @Input() disabled = false
  @Input() cssClass: string
  @Input() iconPosition = 'left'
  @Input() noBorder = false
  @Output() searchFn = new EventEmitter<string>()
  @ViewChild('filterInput', { static: true }) filterInputElement: ElementRef
  @ViewChild('line') lineElement: ElementRef
  @ViewChild('clearIcon') clearIconElement: ElementRef
  clearIconExit = false
  width: number
  destroy$ = new Subject()
  private onChange = (_: any) => null
  private onTouch = () => null

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private el: ElementRef,
  ) {}

  ngOnInit() {}

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn
  }

  writeValue(value: any = ''): void {
    this.renderer.setProperty(this.filterInputElement.nativeElement, 'value', value)
    this.renderClearIcon()
  }

  clearText() {
    this.renderer.setProperty(this.filterInputElement.nativeElement, 'value', '')
    if (this.onChange) {
      this.onChange('')
    }
    this.searchFn.emit('')
    this.filterInputElement.nativeElement.focus()
    this.renderClearIcon()
  }

  inputChange(_value, _event?) {
    this.renderClearIcon()
  }

  inputBlur() {
    this.onTouch()
  }

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
        this.onChange(value)
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
    this.renderClearIcon()
  }

  renderClearIcon() {
    if (this.iconPosition === 'right') {
      if (
        this.filterInputElement.nativeElement.value &&
        this.lineElement &&
        this.clearIconElement
      ) {
        this.clearIconExit = true
      } else if (this.lineElement && this.clearIconElement) {
        this.clearIconExit = false
      }
    } else if (this.filterInputElement.nativeElement.value && this.clearIconElement) {
      this.clearIconExit = true
    } else if (this.clearIconElement) {
      this.clearIconExit = false
    }
    this.cdr.markForCheck()
  }

  ngOnDestroy() {
    this.destroy$.next(true)
  }
}
