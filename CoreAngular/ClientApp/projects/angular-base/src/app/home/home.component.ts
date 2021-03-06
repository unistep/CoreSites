
import { Component, Injector, AfterViewInit } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})

export class HomeComponent extends BaseFormComponent implements AfterViewInit {
  constructor(injector: Injector) {
    super(injector);
  }

  ngAfterViewInit(): void {
    super.setDeviceProperties();
  }
}
