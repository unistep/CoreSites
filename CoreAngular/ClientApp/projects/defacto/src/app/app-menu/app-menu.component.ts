
import { Component, Injector } from '@angular/core';
import { BaseNavMenuComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-nav-menu',
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.css']
})

export class AppMenuComponent extends BaseNavMenuComponent {

  public UserName: any = "";
  public UserID: any = "";

  constructor(injector: Injector, public trs: ServerInterface) {
    super(injector);

    this.setNavbarUserName();
  }


  public onLogout() {
    this.trs.clearSession();
    this.router.navigate(['/']);
    this.setNavbarUserName();
  }


  public setNavbarUserName() {
    this.UserName = this.trs.getUserName();
    this.UserID = this.trs.getUserAccountSysId();

    $("#eid_modal_user_name").text(this.UserName);
    $("#eid_modal_user_id").text(this.UserID);

    $("#eid_user_name").text(this.UserName);
  }
}

