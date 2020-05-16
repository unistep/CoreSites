
import { Component, Injector, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-customer-find',
  templateUrl: './customer-find.component.html',
  styleUrls: ['./customer-find.component.scss']
})

export class CustomerFindComponent extends BaseFormComponent implements OnInit, AfterViewInit, OnDestroy {
  public customerInfo = null;

  initDone: boolean = false;

  public customers: any = [];
  public selectedCustomer: any;

  constructor(injector: Injector,
    public trs: ServerInterface) {
    super(injector);
  }

  onChange(event) {
    this.DoCustomerFind();
  }

  public async DoCustomerFind() {
    var MemberType = 0;
    var phoneNumber = (this.trs.getSysContext() === "4") ?
      this.selectedCustomer.SysId :
      $(document).find('#eid_phone_number')[0].value;

    if (this.selectedCustomer && (this.selectedCustomer.SysId !== 0)) {
      var customerName = this.selectedCustomer.Description;
      var customerID = this.selectedCustomer.SysId;
      var procedureType = this.ugs.queryParam("procedureType");
      this.router.navigate(['new-service-call'], { queryParams: { procedureType, customerName, customerID } });
      return;
    }
    else if (phoneNumber) {
      if (!this.checkForLegalPhoneNumber_defacto(phoneNumber)) {
        return;
      }

      const result: any = await this.trs.fetchCustomer('{"param":"' + phoneNumber + '", "MemberType":"' + MemberType + '"}');
      if (!result) {
        return;
      }

      if (result.MemberInfo) {
        this.customerInfo = result.MemberInfo;
        var customerName = this.customerInfo.Name;
        var customerID = this.customerInfo.SysId;
        var procedureType = this.ugs.queryParam("procedureType");
        this.router.navigate(['new-service-call'], { queryParams: { procedureType, customerName, customerID } });
        return;
      }
    }

    var procedureType = this.ugs.queryParam("procedureType");
    var phoneNumber = $("#eid_phone_number").val();
    this.router.navigate(['customer-register'], { queryParams: { procedureType, phoneNumber } });
  }


  //==================================================================================
  checkForLegalPhoneNumber_defacto(phoneNumber) {
    var areaCode = phoneNumber.substring(0, 2);
    if (areaCode !== "05") {
      this.ugs.Loger("Error: " + this.ugs.uTranslate("Invalid_Area_Code"), true);
      return false;
    }

    if (phoneNumber.length !== 10) {
      this.ugs.Loger("Error: " + this.ugs.uTranslate("Invalid_Phone_Number"), true);
      return false;
    }

    return true;
  }

  //=================================================================================
  ngOnInit(): void {
    var eid_to_remove = this.ugs.isMobileLayout() ? "eid_desktop" : "eid_mobile";
    var element = document.getElementById(eid_to_remove);
    if (element) element.parentNode.removeChild(element);
  }

  //=================================================================================
  ngAfterViewInit(): void {
    super.setsScreenProperties();

    $('.cl_vendor').hide();
    $('.cl_customer').hide();

    $(document).find('li.serviceCall')[0].style.display = "block";
    $(document).find('li.logout')[0].style.display = "block";

    if (this.ugs.queryParam("procedureType") === "ServiceCalls") {
      $("#to_color").css("background-color", "#EFEFEF");
    }
    else {
      $("#to_color").css("background-color", "lightblue");
    }

    this.getCustomerList();
  }

  //=================================================================================
  public async getCustomerList() {
    if (this.trs.getSysContext() !== "4") {
      $('.cl_customer').show();
      $('.cl_customer').focus();
      return;
    }

    $('.cl_vendor').show();
    $('.cl_vendor').focus();

    const result: any = await this.trs.fetchCustomerList();
    if (result) {
      this.customers = result.Entities;
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage)
    //}

    var SysId = 0;
    var Description = this.ugs.uTranslate('New_Customer');
    this.customers.splice(0, 0, { SysId, Description });
    this.selectedCustomer = this.customers[0];
  }

  //=================================================================================
  ngOnDestroy(): void {
  }

  onExit(): void {
    this.router.navigate(['service-call']);
  }
}
