
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UfwInterface } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {

  public UserName: any = "";
  public UserID: any = "";

  constructor(public ufw: UfwInterface,
    private trs: ServerInterface,
    public router: Router) {

      this.setNavbarUserName();
    }

  onChange(event) {
    this.ufw.ugs.adjastUserLanguage(this.ufw.ugs.locale.selectedLanguage);
    var elm_button: any = document.getElementsByClassName("navbar-toggler")[0];
    elm_button.click();
  }

  toggle() {
    var elm_button: any = document.getElementsByClassName("navbar-toggler")[0];
    elm_button.click();
  }

  public onLogout() {
    this.trs.clearSession();
    this.router.navigate(['/']);
    this.setNavbarUserName();
  }

  public onAbout() {
    $('#about-modal').modal('show');
  }

  public OnAboutDone() {
    $("#about-modal .close").click()
  }

  public setNavbarUserName() {
    this.UserName = this.trs.getUserName();
    this.UserID = this.trs.getUserAccountSysId();

    $("#eid_modal_user_name").text(this.UserName);
    $("#eid_modal_user_id").text(this.UserID);

    $("#eid_user_name").text(this.UserName);
  }
}

