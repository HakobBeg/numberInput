import {Injectable} from '@angular/core';

@Injectable()
export class ValidatorService {

  private regularExpression: RegExp;
  private decimalSeparator: string;
  private fractionDigits: number;
  private min: number;
  private max: number;


  constructor() {
  }


  public config( decimalSeparator: string, fractionDigits: number, min: number, max: number) {
    this.regularExpression = new RegExp(`^[-]?\\d*?\\${decimalSeparator}?\\d*$`);
    this.decimalSeparator = decimalSeparator;
    this.fractionDigits = fractionDigits;
    this.min = min;
    this.max = max;
  }

  public isSymbolsValid(expression: string): boolean {
    return this.regularExpression.test(expression);
  }

  private isSizeValid(expression: string): boolean {

    if (this.max) {
      if (this.min) {
        return this.min < parseFloat(expression) && parseFloat(expression) < this.max;
      } else {
        return parseFloat(expression) < this.max;
      }
    } else {
      if (this.min) {
        return parseFloat(expression) > this.min;
      } else {
        return true;
      }
    }
  }

  private isFractionDigitsValid(expression: string): boolean {

    if (expression.indexOf(this.decimalSeparator) >= 0) {
      return expression.split(this.decimalSeparator)[1].length <= this.fractionDigits;
    }
    return true;
  }


  public validate(expression: string): boolean {
    if (expression.length === 0) {
      return true;
    }
    return this.isSymbolsValid(expression) && this.isSizeValid(expression) && this.isFractionDigitsValid(expression);
  }


}
