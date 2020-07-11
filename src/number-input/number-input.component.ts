import {
  AfterViewInit,
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ValidatorService} from '../services/validator.service';
import {FormatterService} from '../services/formatter.service';
import {fromEvent, Observable, Subject, timer} from 'rxjs';
import {debounce, tap} from 'rxjs/operators';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.css'],
  providers: [ValidatorService, FormatterService]
})

export class NumberInputComponent implements OnInit, OnChanges, AfterViewInit {


  @Input() private min: number;
  @Input() private max: number;
  @Input() private milliSeconds: number;
  @Input() private fractionDigits: number;
  @Input() private groupSeparator = ',';
  @Input() private decimalSeparator = '.';
  @Input() private disabled: boolean;
  @Input() private readonly: boolean;
  @Input() public inputValue = '';

  public errorMessage = '';

  @Input() public value: number;
  @Output() public valueChange = new EventEmitter<number>();


  private keyupEventEmitter$: Observable<KeyboardEvent>;
  private valueChecker$ = new Subject<string>();
  @ViewChild('input') private inputElement: ElementRef;

  constructor(private validatorService: ValidatorService, private formatterService: FormatterService) {

  }

  ngOnInit(): void {

    this.validatorService.config(`^[-]?\\d*?\\${this.decimalSeparator}?\\d*$`,
      this.decimalSeparator,
      this.fractionDigits,
      this.min,
      this.max);

    this.formatterService.config(this.groupSeparator, this.decimalSeparator);

    this.valueChecker$.subscribe((value) => {
      if (this.validatorService.validate(value)) {
        if (!this.readonly) {
          if (value) {
            this.valueChange.emit(parseFloat(value));
          }
        }
        value = this.formatterService.format(value);
        this.errorMessage = '';
        this.inputValue = value;
      } else {
        this.errorMessage = 'Something is wrong, please check the conditions!';
      }
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('value')) {
      setTimeout(() => {
        this.valueChecker$.next(this.value.toString());
      }, 0);
    }

    this.validatorService.config(`^[-]?\\d*?\\${this.decimalSeparator}?\\d*$`,
      this.decimalSeparator,
      this.fractionDigits,
      this.min,
      this.max);
    this.formatterService.config(this.groupSeparator, this.decimalSeparator);

  }

  ngAfterViewInit() {
    this.keyupEventEmitter$ = fromEvent<KeyboardEvent>(this.inputElement.nativeElement, 'keyup');
    this.keyupEventEmitter$.pipe(
      debounce(() => timer(this.milliSeconds)),
      tap((event: KeyboardEvent) => {
          this.valueChecker$.next(this.inputValue);
        }
      ),
    ).subscribe((event) => {
      this.valueChecker$.next(this.formatterService.parse(this.inputValue));
    });
  }


  get isDisabled(): boolean {
    return this.disabled;
  }

  get isReadonly(): boolean {
    return this.readonly;
  }

  onKeypressHandler(event: KeyboardEvent) {
    if (!this.validatorService.isSymbolsValid(event.key)) {
      event.preventDefault();
    }
  }


}
