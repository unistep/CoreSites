
import { Component, Injector, AfterViewInit } from '@angular/core';
import { AppMenuComponent } from '../app-menu/app-menu.component';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent extends BaseFormComponent implements  AfterViewInit {
  constructor(injector: Injector,
    private trs: ServerInterface,
    public navBar: AppMenuComponent) {
    super(injector);
    navBar.onLogout();
  }

  
  //=================================================================================
  ngAfterViewInit(): void {
    super.setDeviceProperties();

    $(document).find('li.serviceCall')[0].style.display = "none";
    $(document).find('li.logout')[0].style.display = "none";
    $(document).find('li.user_name_label')[0].style.display = "none";
    $('#eid_name').focus();
  }

  //=================================================================================
  async onLogin() {
    const User = $('#eid_name').val()
    const Password = $('#eid_password').val()

    if (!User || !Password) {
      this.ugs.Loger(this.ugs.locale.uTranslate("Invalid_Login_Attempt"), true);
      return;
    }

    const res = await this.trs.doLogin(User, Password);
    if (!res) return;

    this.trs.saveSession(res);
    this.ClearCash();
    this.router.navigate(['service-call']);
  }

  
  ClearCash() {
    localStorage.setItem('status', "");
    localStorage.setItem('phone', "");
    localStorage.setItem('callNumber', "");
    localStorage.setItem('vendor', "");
    localStorage.setItem('customer', "");
    localStorage.setItem('category', "");
    localStorage.setItem("primeTicketType", "");
  }
}
