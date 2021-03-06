
import { Component, Injector } from '@angular/core';
import { BaseNavMenuComponent } from '../../../../angular-toolkit/src/public-api';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.css']
})

export class AppMenuComponent extends BaseNavMenuComponent {

  constructor(injector: Injector) {
    super(injector);
  }
}
