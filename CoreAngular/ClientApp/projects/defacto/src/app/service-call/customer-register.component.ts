
import { Component, Injector, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-customer-register',
  templateUrl: './customer-register.component.html',
  styleUrls: ['./customer-register.component.scss']
})

export class CustomerRegisterComponent extends BaseFormComponent implements OnInit, AfterViewInit {
  public SysId: string = '';
  initDone: boolean = false;

  constructor(injector: Injector,
    public trs: ServerInterface) {
    super(injector);
  
    this.OnLoad();
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

    $(document).find('li.serviceCall')[0].style.display = "block";
    $(document).find('li.logout')[0].style.display = "block";
    $('#eid_first_name').focus();

    if (this.ugs.queryParam("procedureType") === "ServiceCalls") {
      $("#to_color").css("background-color", "#EFEFEF");
    }
    else {
      $("#to_color").css("background-color", "lightblue");
    }
  }

  async OnLoad() {
    var phoneNumber = this.ugs.queryParam('phoneNumber');
    const result: any = await this.trs.fetchCustomer('{"param":"' + phoneNumber + '"}');
    if ((!result) || (!result.MemberInfo)) return;

    this.SysId = result.MemberInfo.SysId;

    $('#eid_card').val(result.MemberInfo.CardNumber);
    $('#eid_first_name').val(result.MemberInfo.FirstName);
    $('#eid_last_name').val(result.MemberInfo.LastName);
    $('#eid_tz').val(result.MemberInfo.Id);
    $('#eid_birth_year').val(result.MemberInfo.BirthDayYear);
    $('#eid_birth_month').val(result.MemberInfo.BirthDayMonth);
    $('#eid_birth_day').val(result.MemberInfo.BirthDayDay);
    $('#eid_email').val(result.MemberInfo.Email);
  }

  async OnSave() {
    var SysId = this.SysId;
    var CardNumber = $('#eid_card').val();
    var RecommenderCardNumber = '';
    var City = '';
    var Street = '';
    var House = '';
    var ZipCode = '';
    var Phone = ''; 
    var Fax = '';
    var PostCell = '';
    var CellPhone = $('#eid_cellular').val();
    var FirstName = $('#eid_first_name').val();
    var LastName = $('#eid_last_name').val();
    var Gender = '';
    var Id = $('#eid_tz').val();
    var BirthDayYear = $('#eid_birth_year').val();
    var BirthDayMonth = $('#eid_birth_month').val();
    var BirthDayDay = $('#eid_birth_day').val();

    if (BirthDayYear) {
      if (BirthDayYear < 1900 || BirthDayYear > 2020) {
        this.ugs.Loger(this.ugs.uTranslate("Year_Not_In_Range"), true);
        return;
      }
    }
    if (BirthDayMonth) {
      if (BirthDayMonth < 1 || BirthDayMonth > 12) {
        this.ugs.Loger(this.ugs.uTranslate("Month_Not_In_Range"), true);
        return;
      }
    }

    if (BirthDayDay) {
      if (BirthDayDay < 1 || BirthDayDay > 31) {
        this.ugs.Loger(this.ugs.uTranslate("Day_Not_In_Range"), true);
        return;
      }
    }

    var WeddingDayYear = '';
    var WeddingDayMonth = '';
    var WeddingDayDay = '';
    var JoinDayYear = '';
    var JoinDayMonth = '';
    var JoinDayDay = '';
    var Email = $('#eid_email').val();
    var IsSendSms = '';
    var IsSendEmail = '';
    var IsSendPost = '';
    var ExternalGroupId = '';
    var Status = '';
    var ExpDateYear = '';
    var ExpDateMonth = '';
    var ExpDateDay = '';
    var BlankId = '';
    var CountryCode = '';
    var AreaCode = '';
    var BranchCode = '';
    var Comments = '';
    var Apartment = '';

    var MemberContactDetails = {
      SysId, CardNumber, RecommenderCardNumber, City, Street, House, ZipCode,
      Phone, Fax, PostCell, CellPhone, FirstName, LastName, Gender, Id,
      BirthDayYear, BirthDayMonth, BirthDayDay, WeddingDayYear, WeddingDayMonth,
      WeddingDayDay, JoinDayYear, JoinDayMonth, JoinDayDay, Email, IsSendSms,
      IsSendEmail, IsSendPost, ExternalGroupId, Status, ExpDateYear, ExpDateMonth,
      ExpDateDay, BlankId, CountryCode, AreaCode, BranchCode, Comments, Apartment
    };

    var MemberAgents = '';
    var MemberType = 5;

    var member = { MemberContactDetails, MemberAgents, MemberType };

    const result: any = await this.trs.MemberRegistration(member, SysId);
    if (result) {
      var customerName = result.Member.Name;
      var customerID = result.Member.SysId;
      if (SysId) {
        this.router.navigate(['service-call']);
      }
      else {
        var procedureType = this.ugs.queryParam("procedureType");
        this.router.navigate(['new-service-call'], { queryParams: { procedureType, customerName, customerID } });
      }
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }

  OnExit() {
    this.router.navigate(['service-call']);
  }
}
