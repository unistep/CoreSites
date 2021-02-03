
import { Component, Injector, OnInit, AfterViewInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-new-service-call',
  templateUrl: './new-service-call.component.html',
  styleUrls: ['./new-service-call.component.scss']
})

export class NewServiceCallComponent extends BaseFormComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  ticketTypes: any = [];
  selectedTicketType: any;

  itemTypes: any = [];
  selectedItemType: any;

  requestReasons: any = [];
  selectedRequestReason: any;

  vendors: any = [];
	selectedVendor: any;

  public status: any;
  public selectedStatus: any;

  public days = [];
  public selectedDay = null;

  public primeTicketType: any = "0";

  initDone: boolean = false;

	constructor(injector: Injector,
    public trs: ServerInterface) {
		super(injector);

    this.primeTicketType = this.ugs.queryParam("procedureType") == "Orders" ? "2" : "0";

    var id, name;
    for (var i = 1; i <= 30; i++) { id = name = i; this.days.splice(0, 0, { id, name }); }
    this.selectedDay = this.days[0];

  }

  onVendorChange(event) {
    event.currentTarget.blur();;
  }

  //=================================================================================
  ngOnInit(): void {
    var eid_to_remove = this.ugs.isMobileLayout() ? "eid_desktop" : "eid_mobile";
    var element = document.getElementById(eid_to_remove);
    if (element) element.parentNode.removeChild(element);
  }

  onChange(event) {
    this.itemTypes = this.selectedTicketType.ItemTypeList;
    this.selectedItemType = this.itemTypes[0];
    this.requestReasons = this.selectedTicketType.ReasonList;
    this.selectedRequestReason = this.requestReasons[0];

    this.OnLoad();
  }

  OnLoad() {
    this.selectedDay = this.days[30 - this.selectedTicketType.DefaultEstimationDays];
    $('#eid_label_prop_1').html(this.selectedTicketType.ItemProp1Caption);
    $('#eid_label_prop_2').html(this.selectedTicketType.ItemProp2Caption);
    $('#eid_label_prop_3').text(this.selectedTicketType.ItemProp3Caption);
    $('#eid_label_prop_4').text(this.selectedTicketType.ItemProp4Caption);
    $('#eid_label_prop_5').text(this.selectedTicketType.ItemProp5Caption);
    $('#eid_label_prop_6').text(this.selectedTicketType.ItemProp6Caption);

    if (!$('#eid_label_prop_1').text()) $('#eid_prop_1').hide(); else $('#eid_prop_1').show();
    if (!$('#eid_label_prop_2').text()) $('#eid_prop_2').hide(); else $('#eid_prop_2').show();
    if (!$('#eid_label_prop_3').text()) $('#eid_prop_3').hide(); else $('#eid_prop_3').show();
    if (!$('#eid_label_prop_4').text()) $('#eid_prop_4').hide(); else $('#eid_prop_4').show();
    if (!$('#eid_label_prop_5').text()) $('#eid_prop_5').hide(); else $('#eid_prop_5').show();
    if (!$('#eid_label_prop_6').text()) $('#eid_prop_6').hide(); else $('#eid_prop_6').show();

    $("#eid_price").change(this.DoBalance.bind(this));
    $("#eid_down_payment").change(this.DoBalance.bind(this));
    $('#eid_comment').val("");

    this.DoBalance();
  }

  DoBalance() {
    var a = $("#eid_price").val();
    var b = $("#eid_down_payment").val();
    $("#eid_balance").val(a - b);
  }


  async OnSave() {
    var Status = "0";
    var MemberSysId = this.ugs.queryParam("customerID");
    var TicketTypeSysId = this.selectedTicketType.SysId;
    var ItemType = this.selectedItemType;
    var RequestReason = this.selectedRequestReason;
    var OwnerMemberSysID = this.selectedVendor ? this.selectedVendor.SysId : "0";
    var TicketType = this.primeTicketType;
    var EstimationDays = this.selectedDay.id;

    var Comments = $('#eid_comment').val()
    var IsPaid = $('#eid_paid')[0].checked ? "true" : "false";

    var Price = $('#eid_price').val();
    var DownPayment = $('#eid_down_payment').val();
    var Balance = $('#eid_balance').val();

    Price = Price ? Price : '0';
    DownPayment = DownPayment ? DownPayment : '0';
    Balance = Balance ? Balance : '0';

    var ItemProp1 = $('#eid_prop_1').val();
    var ItemProp2 = $('#eid_prop_2').val();
    var ItemProp3 = $('#eid_prop_3').val();
    var ItemProp4 = $('#eid_prop_4').val();
    var ItemProp5 = $('#eid_prop_5').val();
    var ItemProp6 = $('#eid_prop_6').val();

    ItemProp1 = ItemProp1 ? ItemProp1 : '';
    ItemProp2 = ItemProp2 ? ItemProp2 : '';
    ItemProp3 = ItemProp3 ? ItemProp3 : '';
    ItemProp4 = ItemProp4 ? ItemProp4 : '';
    ItemProp5 = ItemProp5 ? ItemProp5 : '';
    ItemProp6 = ItemProp6 ? ItemProp6 : '';

    var TicketParams = {
      Comments, Price, DownPayment, Balance, IsPaid,
      ItemProp1, ItemProp2, ItemProp3, ItemProp4, ItemProp5, ItemProp6
    };

    var Ticket = {
      Status, MemberSysId, TicketTypeSysId, ItemType, RequestReason,
      OwnerMemberSysID, TicketType, EstimationDays, TicketParams
    }

    const result: any = await this.trs.TicketRegistration(Ticket);
    if (result) {
      var callNumber = result.TicketSysId;
      var customerName = this.ugs.queryParam("customerName");
      var procedureType = this.ugs.queryParam("procedureType");
      this.router.navigate(['edit-service-call'], { queryParams: { procedureType, callNumber, customerName } });
    }
  }


  OnCancel() {
    this.router.navigate(['service-call']);
  }


  ngAfterViewChecked(): void {
    if (this.initDone) return;
    this.initDone = true;

    if (this.ugs.queryParam("procedureType") === "ServiceCalls") {
      $("#to_color").css("background-color", "#EFEFEF");
    }
    else {
      $("#to_color").css("background-color", "lightblue");
      $("#eid_form_label").text(this.ugs.locale.uTranslate("New_Order"));
    }
  }

  ngAfterViewInit(): void {
    super.setsScreenProperties();

    $(document).find('li.serviceCall')[0].style.display = "block";
    $(document).find('li.logout')[0].style.display = "block";

    //if (this.session.getSysContext() === "4") {
    //  $(".not_for_vendors").css("visibility", "hidden");
    //}

    this.status = [
      { id: "0", name: this.ugs.locale.uTranslate("New") },
      { id: "1", name: this.ugs.locale.uTranslate("InProcess") },
      { id: "2", name: this.ugs.locale.uTranslate("WaitingForCollect") },
      { id: "3", name: this.ugs.locale.uTranslate("Closed") }
    ];
    this.selectedStatus = this.status[0];

    this.fetchTicketTypes();
    this.fetchVendor();
  }

  ngOnDestroy(): void {
  }


  //=================================================================================
  public async fetchVendor() {
    const result: any = await this.trs.fetchVendor();
     if (result) {
       this.vendors = result.Entities;
       this.selectedVendor = this.vendors[0];
     }
    //else {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }


  //=================================================================================
  public async fetchTicketTypes() {
    var TicketType = this.primeTicketType;
    const result: any = await this.trs.fetchTicketTypes(this.primeTicketType);
    if (result) {
      this.ticketTypes = result.TicketTypes;
      this.selectedTicketType = this.ticketTypes[0];
      this.itemTypes = this.selectedTicketType.ItemTypeList;
      this.selectedItemType = this.itemTypes[0];
      this.requestReasons = this.selectedTicketType.ReasonList;
      this.selectedRequestReason = this.requestReasons[0];
      if (this.ugs.queryParam("procedureType") !== "ServiceCalls") {
      }
      this.OnLoad();
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }
}
