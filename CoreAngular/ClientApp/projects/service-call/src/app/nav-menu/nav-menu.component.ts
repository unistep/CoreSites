
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UfwInterface, ULocalization } from '../../../../angular-toolkit/src/public-api';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  isExpanded = false;

  constructor(public ufw: UfwInterface,
    public locale: ULocalization,
    public router: Router) {
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

  public onLogout() {
    this.router.navigate(['/']);
    //this.setNavbarUserName();
  }

  public onAbout() {
    $('#about-modal').modal('show');
  }

  public OnAboutDone() {
    $("#about-modal .close").click()
  }

  //public setNavbarUserName() {
  //  var at = this.session.getUserName();
  //  if (this.UserName !== at) {
  //    this.UserName = at;
  //  }

  //  $("#eid_user_name").text(this.UserName);
  //}
}

