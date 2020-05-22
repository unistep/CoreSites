
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UfwInterface } from '../../../../angular-toolkit/src/public-api';

//import * as $ from 'jquery';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {

  constructor(public ufw: UfwInterface,
    public router: Router) {
  }

  onChange() {
    this.ufw.ugs.adjastUserLanguage(this.ufw.ugs.selectedLanguage);
    const language = this.ufw.ugs.selectedLanguage;
    this.ufw.post(`ChangeLanguage?language=${language}`);
    //location.reload();
    const elmButton = document.getElementsByClassName("navbar-toggler")[0];
    elmButton.click();
  }

  toggle() {
    const elmButton = document.getElementsByClassName("navbar-toggler")[0];
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

