
import { Component, AfterViewInit } from '@angular/core';
import { BaseFormComponent } from '../templates/base-form.component';

@Component({
  selector: 'app-counter-component',
  templateUrl: './counter.component.html'
})
export class CounterComponent extends BaseFormComponent  implements AfterViewInit {
  
  public currentCount = 0;

  ngAfterViewInit(): void {
    super.setsScreenProperties();
  }

  public incrementCounter() {
    this.currentCount++;
  }
}
