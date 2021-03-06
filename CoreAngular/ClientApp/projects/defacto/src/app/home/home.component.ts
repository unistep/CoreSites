import { Component, Injector, AfterViewInit } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})

export class HomeComponent extends BaseFormComponent implements AfterViewInit {
  constructor(injector: Injector, public trs: ServerInterface) {
    super(injector);
  }

  ngAfterViewInit(): void {
    super.setDeviceProperties();

    if (this.trs.isAuthValid()) {
      $(document).find('li.serviceCall')[0].style.display = "block";
      $(document).find('li.logout')[0].style.display = "block";
      $(document).find('li.login')[0].style.display = "none";
    }
    else {
      $(document).find('li.serviceCall')[0].style.display = "none";
      $(document).find('li.logout')[0].style.display = "none";
      $(document).find('li.login')[0].style.display = "block";
    }
  }
}
