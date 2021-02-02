
import { Component, Injector, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';
import { PopupService } from '../services/popup.service';
import { TakePhotoComponent } from '../take-photo/take-photo.component';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'app-edit-service-call',
  templateUrl: './edit-service-call.component.html',
  styleUrls: ['./edit-service-call.component.scss']
})

export class EditServiceCallComponent extends BaseFormComponent implements OnInit, AfterViewInit, OnDestroy {
  vendors: any = [];
	selectedVendor: any;

  public days = [];
  public selectedDay = null;

  transaction: any;
  status: string;

  Photos: [];
  fileLastIndex: number = 1;
  
  public primeTicketType: any = "0";
  initDone: boolean = false;

  public MemberPhone: string = "";
  private isAllowEdit: boolean = true;

  constructor(injector: Injector,
    public trs: ServerInterface,
    public modalService: PopupService) {
		super(injector);

    var id, name;
    for (var i = 0; i <= 30; i++) { id = name = i; this.days.splice(0, 0, { id, name }); }
    this.selectedDay = this.days[0];

    this.primeTicketType = this.ugs.queryParam("procedureType") == "Orders" ? "2" : "0";
  }

  //=================================================================================
  ngOnInit(): void {
    var eid_to_remove = this.ugs.isMobileLayout() ? "eid_desktop" : "eid_mobile";
    var element = document.getElementById(eid_to_remove);
    if (element) element.parentNode.removeChild(element);
  }

  swap(event) {
    //if (img.className !== "full-size") img.className = "full-size";
    //else img.className = "";

    var modal = document.getElementById('eid_modal_photo');
    var modalImg = document.getElementById('img_modal');

    modal.style.display = "block";
    (modalImg as any).src = event.currentTarget.src;

    var span = document.getElementsByClassName("close")[0];

  }

  ClosePhoto() {
    document.getElementById('eid_modal_photo').style.display = "none";
  }

  onDial() {
    var link = "tel:" + this.transaction.Ticket.MemberPhone;
    window.location.href = link;
  }


  OnLoad() {
    this.isAllowEdit = this.transaction.Ticket.IsAllowEdit;
    $('#eid_ticket_type').text(this.transaction.Ticket.ItemType);
    $('#eid_request_reason').text(this.transaction.Ticket.RequestReason);
    this.selectedVendor = this.findSelectedItem(this.vendors, "SysId", this.transaction.Ticket.OwnerMemberSysId);
    this.selectedDay = this.findSelectedItem(this.days, "id", this.transaction.Ticket.EstimationDays);

    $('#eid_label_prop_1').html(this.transaction.TicketType.ItemProp1Caption);
    $('#eid_label_prop_2').html(this.transaction.TicketType.ItemProp2Caption);
    $('#eid_label_prop_3').text(this.transaction.TicketType.ItemProp3Caption);
    $('#eid_label_prop_4').text(this.transaction.TicketType.ItemProp4Caption);
    $('#eid_label_prop_5').text(this.transaction.TicketType.ItemProp5Caption);
    $('#eid_label_prop_6').text(this.transaction.TicketType.ItemProp6Caption);

    $('#eid_prop_1').val(this.transaction.Ticket.TicketParams.ItemProp1);
    $('#eid_prop_2').val(this.transaction.Ticket.TicketParams.ItemProp2);
    $('#eid_prop_3').val(this.transaction.Ticket.TicketParams.ItemProp3);
    $('#eid_prop_4').val(this.transaction.Ticket.TicketParams.ItemProp4);
    $('#eid_prop_5').val(this.transaction.Ticket.TicketParams.ItemProp5);
    $('#eid_prop_6').val(this.transaction.Ticket.TicketParams.ItemProp6);

    if (!$('#eid_label_prop_1').text()) $('#eid_prop_1').hide();
    if (!$('#eid_label_prop_2').text()) $('#eid_prop_2').hide();
    if (!$('#eid_label_prop_3').text()) $('#eid_prop_3').hide();
    if (!$('#eid_label_prop_4').text()) $('#eid_prop_4').hide();
    if (!$('#eid_label_prop_5').text()) $('#eid_prop_5').hide();
    if (!$('#eid_label_prop_6').text()) $('#eid_prop_6').hide();

    $('#eid_comment').html(this.transaction.Ticket.TicketParams.Comments);

    $('#eid_price').val(this.transaction.Ticket.TicketParams.Price);
    $('#eid_down_payment').val(this.transaction.Ticket.TicketParams.DownPayment);
    $('#eid_balance').val(this.transaction.Ticket.TicketParams.Balance);
    $('#eid_paid').prop('checked', this.transaction.Ticket.TicketParams.IsPaid);

    this.setButtonsState(this.transaction.Ticket.Status);
    $("#eid_price").change(this.DoBalance.bind(this));
    $("#eid_down_payment").change(this.DoBalance.bind(this));

    this.MemberPhone = this.transaction.Ticket.MemberPhone;
    this.DoBalance();

    var imgg: any = $(".pics");
    for (var x = 0; x < imgg.length; x++) {
      imgg[x].src = "";
    }

    imgg.hide();

    for (var i = 0; i < this.transaction.Ticket.TicketParams.ImageList.length; i++) {
      var fileIndex = this.getFileIndex(this.transaction.Ticket.TicketParams.ImageList[i]);
      if (fileIndex >= this.fileLastIndex) this.fileLastIndex = fileIndex + 1;

      var img: any = $("#img_" + (i + 1).toString());

      if (img && img.length > 0) {
        img[0].src = this.transaction.Ticket.TicketParams.ImageList[i];
        img.show();
      }
    }

    this.checkForEdit();
  }

  checkForEdit() {
    $('#eid_ticket_type').prop("disabled", !this.isAllowEdit);
    $('#eid_request_reason').prop("disabled", !this.isAllowEdit);

    $('#eid_prop_1').prop("disabled", !this.isAllowEdit);
    $('#eid_prop_2').prop("disabled", !this.isAllowEdit);
    $('#eid_prop_3').prop("disabled", !this.isAllowEdit);
    $('#eid_prop_4').prop("disabled", !this.isAllowEdit);
    $('#eid_prop_5').prop("disabled", !this.isAllowEdit);
    $('#eid_prop_6').prop("disabled", !this.isAllowEdit);

    $('#eid_comment').prop("disabled", !this.isAllowEdit);

    //$('#eid_price').prop("disabled", !this.isAllowEdit);
    //$('#eid_down_payment').prop("disabled", !this.isAllowEdit);
    //$('#eid_paid').prop("disabled", !this.isAllowEdit);
    $('#eid_vendors').prop("disabled", !this.isAllowEdit);
    $('#eid_expected_days').prop("disabled", !this.isAllowEdit);
  }


  getFileIndex(path) {
    var basename = this.ugs.getBaseName(path);
    var pos = basename.lastIndexOf("img_"); 
    var fileIndex = parseInt(basename.substring(pos + 4));
    return fileIndex;
  }


  DoBalance() {
    if ((this.trs.getSysContext() === "4")
      && (this.transaction.Ticket.ReferenceTicketSysId)) {
      $(".not_for_vendors").css("visibility", "hidden");
    }

    var a = $("#eid_price").val();
    var b = $("#eid_down_payment").val();
    $("#eid_balance").val(a - b);
  }


  setButtonsState(_status) {
    var colors = ["#00688F", "#FFCC00", "#3CB878", "#B83C3C"];
    this.status = _status;
    var elm = document.getElementById('eid_Accepted');
    elm.style.backgroundColor = "#707070"
    $('#eid_InProcess').css("background", "#707070");
    $('#eid_WaitToCollect').css("background", "#707070");
    $('#eid_Closed').css("background", "#707070");

    switch (_status) {
      case 0:
        elm.style.backgroundColor = colors[_status];
        break;
      case 1:
        $('#eid_InProcess').css("background", colors[_status]);
        break;
      case 2:
        $('#eid_WaitToCollect').css("background", colors[_status]);
        break;
      case 3:
        $('#eid_Closed').css("background", colors[_status]);
        break;
    }
  }

  async OnSave(print?) {
    var OwnerMemberSysID = "0";
    if (this.selectedVendor)
      if (this.selectedVendor !== undefined)
        OwnerMemberSysID = this.selectedVendor.SysId;

    var SysId = this.transaction.Ticket.SysId;
    var Status = this.status;
    var MemberSysId = this.transaction.Ticket.MemberSysId;
    var ItemType = this.transaction.Ticket.ItemType;
    var RequestReason = this.transaction.Ticket.RequestReason;
    //var OwnerMemberSysID = (this.selectedVendor !== undefined) && this.selectedVendor ? this.selectedVendor.SysId : "";
    var TicketTypeSysId = this.transaction.TicketType.SysId;
    var EstimationDays = this.selectedDay.id;

    var Price = $('#eid_price').val();
    var DownPayment = $('#eid_down_payment').val();
    var Balance = $('#eid_balance').val();
    var elmIsPaid = $('#eid_paid')[0];
    var IsPaid = elmIsPaid.checked ? "true" : "false";
    var ItemProp1 = $('#eid_prop_1').val();
    var ItemProp2 = $('#eid_prop_2').val();
    var ItemProp3 = $('#eid_prop_3').val();
    var ItemProp4 = $('#eid_prop_4').val();
    var ItemProp5 = $('#eid_prop_5').val(); 
    var ItemProp6 = $('#eid_prop_6').val();

    var Comments = $('#eid_comment').val();

    var TicketParams = {
      Comments, Price, DownPayment, Balance, IsPaid,
      ItemProp1, ItemProp2, ItemProp3, ItemProp4, ItemProp5, ItemProp6
    };

    var Ticket = {
      SysId, Status, MemberSysId, ItemType, RequestReason, OwnerMemberSysID, TicketTypeSysId, EstimationDays, TicketParams
    }

    const result: any = await this.trs.TicketUpdate(Ticket);
    if (result) {
      if (print) {
        var TicketSysId = this.transaction.Ticket.SysId;
        const result: any = await this.trs.TicketPrint({ TicketSysId });
        if (result) {
          this.router.navigate(['service-call']);
        }
      }
      else {
        this.router.navigate(['service-call']);
      }
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }

  async OnSavePrint() {
    this.OnSave(true);
  }

  async OnHistory() {
    var TicketSysId = this.transaction.Ticket.SysId;
    const result: any = await this.trs.TicketHistory({ TicketSysId });
    //if ((!result) || (!result.Actions)) {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //  return;
    //}

    this.bindHistory(result);

    $('#eid_history_table tr td').click(this.historyTableClicked.bind(this));

    $('#history-modal').modal();
    $('#history-modal').modal('show');
  }

  //=================================================================================
  historyTableClicked(e) {
    var table: any = document.getElementById('eid_history_table');
    if (!table) return;
    var cells = table.getElementsByTagName('td');

    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('high-light');
    }

    cells = table.rows[e.currentTarget.parentNode.rowIndex].getElementsByTagName('td');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.add('high-light');
    }
  }


  OnHistoryDone() {
    $("#history-modal .close").click()
  }

  bindHistory(result) {
    Array.from(document.getElementsByTagName('table')).forEach((table) => {
      var tableRows: any = "";
      if (table.id == 'eid_history_table') {

        while (table.tBodies.length > 0) {
          table.removeChild(table.tBodies[0])
        }

        var tblBody = document.createElement("tbody");
        table.appendChild(tblBody);

        tableRows = result.Actions;

        tableRows.forEach((tableRow) => {
          var row = this.createHistoryTableRow(table, tableRow);
          //var _row_wrap = document.createElement('div');
          //_row_wrap.style.cssText = 'padding-top: 10px !important;';

          tblBody.appendChild(row);
          //tblBody.appendChild(_row_wrap);
        });
      }
    })
  }

  //=================================================================================
  createHistoryTableRow(table, json_table_row) {
    var _row = document.createElement('tr');

    Array.from(table.getElementsByTagName('th')).forEach((header: HTMLInputElement) => {
      var _cell = document.createElement('td');
      var direction = localStorage.getItem('direction');
      var textAlign = 'text-align: ' + (direction === 'rtl' ? 'right' : 'left') + ';';

      //_cell.style.cssText = 'margin: 0 !important; padding-right: 3px; padding-left: 3px; border: solid 1px gray; vertical-align: middle; background-color: white; color: black; ' + textAlign;
      _cell.style.cssText = 'margin: 0 !important; font-weight: bold; padding-top: 5px; padding-right: 3px; padding-left: 3px; vertical-align: middle; background:#C5C5C5; color: black; ' + textAlign;
      var _label = document.createElement("Label");

      var value = '';
      var bind = header.getAttribute('data-bind');
      if (bind) value = json_table_row[bind];

      if (bind && value) {
        _label.innerHTML = value;
      }

      _cell.appendChild(_label);
      _row.appendChild(_cell);
    });

    return _row;
  }

  OnSendSms() {
    $('#send-sms-modal').modal('show');

    $('#send-sms-modal').on('shown.bs.modal', function () {
      $('#eid_send_sms_message').focus();
    })
  }

  async OnSendSmsDone(confirm) {
    var SMSMessage = $('#eid_send_sms_message').val();
    $('#eid_send_sms_message').val("");

    $("#send-sms-modal .close").click()
    if (!confirm) return;

    var TicketSysId = this.transaction.Ticket.SysId;
    const result: any = await this.trs.TicketSendSMS({ SMSMessage, TicketSysId });
    //if (result.ErrorCode !== 0) {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }


  OnConversationSummary() {
    $('#conversation_summary-modal').modal('show');
    $('#conversation_summary-modal').on('shown.bs.modal', function () {
      $('#eid_conversation_message').focus();
    })
  }


  async OnConversationSummaryDone(caller, confirm) {
    var ConversatioConclution = $('#eid_conversation_message').val();
    $('#eid_conversation_message').val("");

    $("#conversation_summary-modal .close").click()
    if (!confirm) return;

    var TicketSysId = this.transaction.Ticket.SysId;
    const result: any = await this.trs.TicketAddConversation({ ConversatioConclution, TicketSysId });
    //if (result.ErrorCode !== 0) {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }


  OnExit() {
    $('#exit-modal').modal();
    $('#exit-modal').modal('show');
  }

 
  OnExitDone(confirm) {
    $("#exit-modal .close").click()
    if (!confirm) return;

    //window.onbeforeunload = null;
    this.router.navigate(['service-call']);
  }

  
  ngAfterViewInit(): void {
    super.setsScreenProperties();

    $(document).find('li.serviceCall')[0].style.display = "none";
    $(document).find('li.logout')[0].style.display = "block";

    if (this.ugs.queryParam("procedureType") === "ServiceCalls") {
      $("#to_color").css("background-color", "#EFEFEF");
    }
    else {
      $("#eid_form_label").text(this.ugs.locale.uTranslate("Edit_Order"));
      $("#to_color").css("background-color", "lightblue");
    }

    if (this.trs.getSysContext() === "4") {
      //$('#eid_vendor_label').hide();
      //$('#eid_vendors').hide();
      $('.eid_new_call').hide();
      $('.eid_new_order').hide();

      $('td:nth-child(3),th:nth-child(3)').hide();
    }

    var self = this;

    $('.cameraFrame').click(function ($event) {
      var callerInput = this.getElementsByTagName('input')[0];
      if (callerInput == null) return;

      callerInput.click();
    });

    $('.cameraFrame input').change(function ($event) {
      var _photos = (this as any).files;
      if (!_photos) return;

      var callerCam = this.parentElement;
      var callerImage = callerCam.getElementsByTagName('div')[0];
      var callerFa = callerCam.getElementsByTagName('i')[0];

      callerFa.style.display = 'none';
      callerImage.style.display = 'block';

      var reader = new FileReader();
      reader.onloadend = function () {
        callerImage.style.background = 'url("' + reader.result + '")';
        callerImage.style.backgroundSize = "cover";
      }

      reader.readAsDataURL(_photos[0]);
      var remoteFileName = (self.transaction.Ticket.SysId + "_" + self.transaction.Ticket.TicketParams.ImageList.length + 1).toString();
      var remoteFilePath = remoteFileName;

      self.trs.uploadFile(self, self.reload, _photos, self.trs.getToken(), self.transaction.Ticket.SysId);
    });

    this.fetchVendor();
  }

  async reload() {
    var TicketSysId = this.transaction.Ticket.SysId;
    const result: any = await this.trs.fetchTicket(TicketSysId);
    if (result) {
      this.transaction = result;
      this.OnLoad();
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }

  OnPhoto() {
    if (!this.isAllowEdit) return;
    if (!this.ugs.isMobileLayout()) this.OnPhotoDesktop();
    else this.OnPhotoMobile();
  }

  OnPhotoMobile() {
    var callerInput = document.getElementById('eid_camera_input');
    if (callerInput == null) return;

    callerInput.click();
  }

  async OnPhotoDesktop() {
    const result = await this.modalService.show<TakePhotoComponent>(TakePhotoComponent);
    var existingUri = "";
    if (result.success) {
      var _photos: any = [];
      for (var i = 0; i < result.result.length; i++) {
        var blob = this.dataURItoBlob(result.result[i]);
        if (blob.type.startsWith('image')) {
          var ext = blob.type.substring(6); 
          _photos.push(new File([blob], `img_${this.fileLastIndex + i}.${ext}`));
        }
        else {
          var file = this.ugs.getFileName(result.result[i].toString());
          existingUri += file + ","
        }
      }

      existingUri = this.ugs.rtrim(",", existingUri);
      this.trs.uploadFile(this, this.reload, _photos, this.trs.getToken(), this.transaction.Ticket.SysId, existingUri);
    }
  }

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }


  ngOnDestroy(): void {
  }


  //=================================================================================
  public async fetchVendor() {
    const result: any = await this.trs.fetchVendor();
     if (result) {
       this.vendors = result.Entities;
       this.selectedVendor = this.vendors[0];
       this.fetchTicket();
     }
    //else {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }


  //=================================================================================
  public async fetchTicket() {
    var TicketSysId = this.ugs.queryParam("callNumber");
    const result: any = await this.trs.fetchTicket(TicketSysId);
    if (result) {
      this.transaction = result;
      //this.itemTypes = result.TicketType.ItemTypeList;
      //this.selectedItemType = this.itemTypes[0];
      //this.requestReasons = result.TicketType.ReasonList;
      //this.selectedRequestReason = this.requestReasons[0];
      this.OnLoad();
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }

  findSelectedItem(dataArray, itemName, itemValue) {
    var dataRows = dataArray.filter(item => {
      if (!itemName) return item === itemValue
      else return item[itemName] === itemValue;
    });

    return (dataRows.lenght == 0 ? '[]' : dataRows[0]);
  }
}
