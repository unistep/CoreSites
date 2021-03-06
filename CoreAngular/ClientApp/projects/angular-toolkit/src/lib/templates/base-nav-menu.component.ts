
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ULocalization } from '../services/u-localizaion.service';
import { UfwInterface } from '../services/ufw-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'base-nav-menu',
  templateUrl: './base-nav-menu.component.html',
  styleUrls: ['./base-nav-menu.component.css']
})

export class BaseNavMenuComponent {
  isExpanded = false;

  public router:  Router = null;
  public ufw:     UfwInterface = null;
  public locale:  ULocalization;

  constructor(injector: Injector) {
    this.router = injector.get(Router);
    this.ufw = injector.get(UfwInterface);
    this.locale = injector.get(ULocalization);
  }

  onChange() {
    this.locale.adjastSelectedLanguage(true);

    const elmButton: any = document.getElementsByClassName("navbar-toggler")[0];
    elmButton.click();
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    const elmButton: any = document.getElementsByClassName("navbar-toggler")[0];
    elmButton.click();
  }

  public onAbout() {
    $('#about-modal').modal('show');
  }
}

