import { Pipe, PipeTransform } from '@angular/core';
import { ULocalization } from './u-localizaion.service';
//import { timer } from 'rxjs';

@Pipe({ name: 'translate', pure: false })

export class LocalePipe implements PipeTransform {

  constructor(public ulocale: ULocalization) {
  }

  transform(key: string): string {
    return this.ulocale.uTranslate(key);
  }
}
