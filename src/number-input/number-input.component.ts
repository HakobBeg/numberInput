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
import {fromEvent, Observable, timer} from 'rxjs';
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

  @Input() public value: string;
  @Output() public valueChange = new EventEmitter<string>();


  private keyupEventEmitter$: Observable<KeyboardEvent>;
  @ViewChild('input') private inputElement: ElementRef;

  constructor(private validatorService: ValidatorService, private formatterService: FormatterService) {

  }

  ngOnInit(): void {
    this.configValidator();
    this.formatterService.config(this.groupSeparator, this.decimalSeparator);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.configValidator();
    this.formatterService.config(this.groupSeparator, this.decimalSeparator);
    let tmpValue = this.formatterService.parse(this.value);
    if (this.validatorService.validate(tmpValue)) {
      tmpValue = this.formatterService.format(tmpValue);
      this.errorMessage = '';
      this.inputValue = tmpValue;
      if (!this.readonly) {
        setTimeout(() => {
          this.valueChange.emit(this.formatterService.parse(this.inputValue));
        }, 0)
        ;
      }
    } else {
      this.errorMessage = 'Somthing is wrong, please check the conditions!';
    }
  }

  ngAfterViewInit() {
    this.keyupEventEmitter$ = fromEvent<KeyboardEvent>(this.inputElement.nativeElement, 'keyup');
    this.keyupEventEmitter$.pipe(
      debounce(() => timer(this.milliSeconds)),
      tap((event: KeyboardEvent) => {
          let tmpValue = this.formatterService.parse(this.inputValue);
          if (this.validatorService.validate(tmpValue)) {
            tmpValue = this.formatterService.format(tmpValue);
            this.errorMessage = '';
            if (!this.readonly) {
              this.valueChange.emit(tmpValue);
            }
            this.inputValue = tmpValue;
          } else {
            this.errorMessage = 'Somthing is wrong, please check the conditions!';
          }

        }
      ),
    ).subscribe();
  }


  configValidator() {
    this.validatorService.config(`^[-]?\\d*?\\${this.decimalSeparator}?\\d*$`,
      this.decimalSeparator,
      this.fractionDigits,
      this.min,
      this.max);
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
