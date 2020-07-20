import {
  Component, ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ValidatorService} from '../services/validator.service';
import {FormatterService} from '../services/formatter.service';
import {Subject, timer} from 'rxjs';
import {debounce, tap} from 'rxjs/operators';

@Component({
  selector: 'app-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.css'],
  providers: [ValidatorService, FormatterService]
})

export class NumberInputComponent implements OnInit, OnChanges {


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
  public oldValue: string;

  @Input() public value: number;
  @Output() public valueChange = new EventEmitter<number>();


  public keyupEventEmitter$ = new Subject<Event>();
  private valueChecker$ = new Subject<string>();
  @ViewChild('input') private inputElement: ElementRef;

  constructor(private validatorService: ValidatorService, private formatterService: FormatterService) {

  }

  ngOnInit(): void {

    this.keyupEventEmitter$.pipe(
      debounce(() => timer(this.milliSeconds)),
      tap(() => {
          this.valueChecker$.next(this.inputValue);
        }
      ),
    ).subscribe(() => {
      this.valueChecker$.next(this.formatterService.parse(this.inputValue));
    });


    this.valueChecker$.subscribe((value) => {
      if (this.validatorService.validate(value)) {
        if (!this.readonly && value) {
          this.valueChange.emit(parseFloat(value));
        }
        value = this.formatterService.format(value);
        this.errorMessage = '';
        this.inputValue = value;
      } else {
        this.errorMessage = 'Something is wrong, please check the conditions!';
      }
    });

  }

  ngOnChanges(changes: { groupSeparator, decimalSeparator, fractionDigits, max, min, milliSeconds, value }) {
    if (changes.hasOwnProperty('value')) {
      setTimeout(() => {
        this.valueChecker$.next(this.value.toString());
      }, 0);
    }
    if (changes.hasOwnProperty('decimalSeparator')
      || changes.hasOwnProperty('fractionDigits')
      || changes.hasOwnProperty('min')
      || changes.hasOwnProperty('max')) {
      this.validatorService.config(
        this.decimalSeparator,
        this.fractionDigits,
        this.min,
        this.max);
    }
    if (changes.hasOwnProperty('decimalSeparator') || changes.hasOwnProperty('groupSeparator')) {
      this.formatterService.config(this.groupSeparator, this.decimalSeparator);

    }
  }



  get isDisabled()
    :
    boolean {
    return this.disabled;
  }

  get isReadonly()
    :
    boolean {
    return this.readonly;
  }

  onKeypressHandler(event: KeyboardEvent) {
    if (!this.validatorService.isSymbolsValid(event.key)) {
      event.preventDefault();
    }
  }

  onFocus() {
    this.oldValue = this.inputValue;
  }

  onFocusOut() {
    if (!this.validatorService.validate(this.inputValue)) {
      this.inputValue = this.oldValue;
    }
  }

}
