import {Injectable} from '@angular/core';

@Injectable()


export class FormatterService {


  private groupSeparator = ',';
  private decimalSeparator = '.';


  constructor() {
  }


  config(groupSeparator: string, decimalSeparator: string) {
    this.decimalSeparator = decimalSeparator;
    this.groupSeparator = groupSeparator;

  }

  addGroupSeparatorToNumber(expression: string): string {
    return expression.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, this.groupSeparator);
  }


  setZero(expression: string): string {
    const dotIndex = expression.indexOf(this.decimalSeparator);
    if (dotIndex >= 0) {
      if (dotIndex === 0) {
        return '0' + expression;
      }
      if (!/[0-9]/.test(expression.charAt(dotIndex - 1))) {
        return expression.slice(0, dotIndex) + '0' + expression.slice(dotIndex, expression.length);
      }
    }
    return expression;
  }

  removeExcessiveZeroes(expression: string): string {
    let sign = '';
    if (expression[0] === '-' || expression[0] === '+') {
      sign = expression[0];
      expression = expression.slice(1, expression.length);
    }

    while (true) {
      if (expression.startsWith('0') && expression[1] !== '.' && expression.length > 1) {
        expression = expression.slice(1, expression.length);
      } else {
        break;
      }
    }
    return sign + expression;
  }


  format(expression: string): string {
    return this.addGroupSeparatorToNumber(this.setZero(this.removeExcessiveZeroes(expression)));
  }

  parse(expression: string) {
    return expression.split(this.groupSeparator).join('');
  }

}
