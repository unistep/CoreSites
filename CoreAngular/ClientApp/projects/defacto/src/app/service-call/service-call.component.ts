
import { Component, Injector, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';
import { ServerInterface } from '../services/server-interface';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';

import * as $ from 'jquery';
declare var $: any;

@Component({
	selector: 'app-service-call',
	templateUrl: './service-call.component.html',
	styleUrls: ['./service-call.component.scss']
})

export class ServiceCallComponent extends BaseFormComponent
  implements OnInit, AfterViewInit {
	vendors: any = [];
	selectedVendor: any;

  public status: any = [];
  public selectedStatus: any;

  public customers: any = [];
  public selectedCustomer: any;

  public categories: any = [];
  public selectedCategory: any;

  public primeTicketType: any = "0";

  public transactions = [];

  public TicketPKey: string = '';

  constructor(injector: Injector,
    public trs: ServerInterface,
    public navBar: NavMenuComponent) {
    super(injector);

    var _primeTickeType = this.ugs.getLocalStorageItem("primeTicketType");
    if (_primeTickeType) {
      this.primeTicketType = _primeTickeType;
    }
    this.navBar.setNavbarUserName();
  }

  removeElementsByClass(className) {
    var elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  sortTable(n, id) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(id);
    this.removeElementsByClass('table-space')

    switching = true;
    //Set the sorting direction to ascending:
    dir = "asc";
    /*Make a loop that will continue until
    no switching has been done:*/
    while (switching) {
      //start by saying: no switching is done:
      switching = false;
      rows = table.rows;
      /*Loop through all table rows (except the
      first, which contains table headers):*/
      for (i = 1; i < (rows.length - 1); i++) {
        //start by saying there should be no switching:
        shouldSwitch = false;
        /*Get the two elements you want to compare,
        one from current row and one from the next:*/
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        /*check if the two rows should switch place,
        based on the direction, asc or desc:*/
        if (dir == "asc") {
          if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
            //if so, mark as a switch and break the loop:
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        /*If a switch has been marked, make the switch
        and mark that a switch has been done:*/

        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);

        switching = true;
        //Each time a switch is done, increase this count by 1:
        switchcount++;
      } else {
        /*If no switching has been done AND the direction is "asc",
        set the direction to "desc" and run the while loop again.*/
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
    this.createTableSpace(id);
  }

  createTableSpace(id) {
    var table: any = document.getElementById(id);
    var tableRows = table.rows;

    for (var i = 0; i < tableRows.length; i)
    {
      var _row_wrap = document.createElement('div');
      _row_wrap.setAttribute('class', 'table-space');
      _row_wrap.style.cssText = 'padding-top: 10px !important;';

      tableRows[i].parentNode.insertBefore(_row_wrap, tableRows[i]);
      i++;
    }
  }

  DoAdvancedSearch() {
    var callNumber = $('#eid_call_number').val();
    $('#eid_call_number_m').val(callNumber);

    $('#advanced-search-modal').modal('show');

    $('#advanced-search-modal').on('shown.bs.modal', function () {
      $('.eid_call_number_m').focus();
    })
  }

  AdvancedSearchDone() {
    $("#advanced-search-modal .close").click()

    if (!confirm) return;
    var callNumber = $('#eid_call_number_m').val();
    $('#eid_call_number').val(callNumber);

    callNumber = $('#eid_call_number').val();
    this.DoFilter();
  }


  ChangeTicketType(_ticketType) {
    this.primeTicketType = _ticketType;

    if (_ticketType == "0") {
      $("#eid_service_call").removeClass("df_button_trans").addClass("df_button_blue");
      $("#eid_orders").removeClass("df_button_blue").addClass("df_button_trans");
      $("#to_color").css("background-color", "#EFEFEF");
    }
    else {
      $("#eid_service_call").removeClass("df_button_blue").addClass("df_button_trans");
      $("#eid_orders").removeClass("df_button_trans").addClass("df_button_blue");
      $("#to_color").css("background-color", "lightblue");
    }

    localStorage.setItem("primeTicketType", this.primeTicketType);
    this.fetchTransactions();
  }


  onChange(event) {
    this.DoFilter();
  }


  //=================================================================================
  public async setPageControlValues() {
    const result: any = await this.trs.fetchVendor();
    if (result) {
      this.vendors = result.Entities;
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage)
    //}

    var SysId = 0;
    var Description = this.ugs.uTranslate('Choose_Vendor');
    this.vendors.splice(0, 0, { SysId, Description });
    this.selectedVendor = this.vendors[0];

    var savedVendor = this.ugs.getLocalStorageItem('vendor');

    if (savedVendor) {
      this.selectedVendor = this.findSelectedItem(this.vendors, 'SysId', parseInt(savedVendor));
    }

    $('#eid_customer_phone').val(this.ugs.getLocalStorageItem('phone'));
    //$('#eid_customer_phone').val(this.ugs.getLocalStorageItem('phone'));

    this.getCustomerList();

    this.getCategoryList();

    this.getStatusItems(null);
  }

  //=================================================================================
  public async getCustomerList() {
    if (this.trs.getSysContext() !== "4") {
      $('.cl_customer').show();
      return;
    }

    $('.cl_vendor').show();

    const result: any = await this.trs.fetchCustomerList();
    if (result) {
      this.customers = result.Entities;
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage)
    //}

    var SysId = 0;
    var Description = this.ugs.uTranslate('Choose_Customer');
    this.customers.splice(0, 0, { SysId, Description });
    this.selectedCustomer = this.customers[0];

    var savedCustomer = this.ugs.getLocalStorageItem('customer');

    if (savedCustomer) {
      this.selectedCustomer = this.findSelectedItem(this.customers, 'SysId', parseInt(savedCustomer));
    }
  }

  //=================================================================================
  public async getCategoryList() {
    const result: any = await this.trs.fetchCategories();
    if (result) {
      this.categories = result.Entities;
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage)
    //}

    var SysId = 0;
    var Description = this.ugs.uTranslate('Choose_Category');
    this.categories.splice(0, 0, { SysId, Description });
    this.selectedCategory = this.customers[0];

    var savedCategory = this.ugs.getLocalStorageItem('category');

    if (savedCategory) {
      this.selectedCategory = this.findSelectedItem(this.categories, 'SysId', parseInt(savedCategory));
    }
  }

  getStatusItems(response?) {
    this.status = [
      { id: "0", name: this.ugs.uTranslate("New") },
      { id: "1", name: this.ugs.uTranslate("InProcess") },
      { id: "2", name: this.ugs.uTranslate("WaitingForCollect") },
      { id: "3", name: this.ugs.uTranslate("Closed") }
    ];
    this.selectedStatus = this.status[0];

    var savedStatus = localStorage.getItem('status');

    if (savedStatus) {
      this.selectedStatus = this.findSelectedItem(this.status, 'id', savedStatus);
    }

    this.ChangeTicketType(this.primeTicketType);
  }


  //=================================================================================
  public async fetchTransactions() {
    var query = this.buildQuery();

    const result: any = await this.trs.fetchTransactions(query);
    if (result) {
      this.transactions = result.Tickets;
      this.ugs.Loger(`${this.transactions.length} ${this.ugs.uTranslate("Records_Found")}`);
    }

    this.bindTransactions();

    $('#eid_call_table tr td').click(this.mainTableClicked.bind(this));
    $("#eid_call_table tr td").dblclick(this.mainTableDbClicked.bind(this));
  }


  //=================================================================================
  mainTableDbClicked(e) {
    var cellIndex = e.currentTarget.cellIndex;
    var rowIndex = e.currentTarget.parentNode.rowIndex - 1;
    var rowTable = this.transactions[rowIndex];
    this.DoEdit(rowTable);
  }

  //=================================================================================
  mainTableClicked(e) {
    var table: any = document.getElementById('eid_call_table');
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


  public buildQuery() {
    var vendorID = this.selectedVendor ? this.selectedVendor.SysId : 0;
    var TicketMemberId = this.selectedCustomer ? this.selectedCustomer.SysId : 0;
    var FilterId = this.selectedCategory ? this.selectedCategory.SysId : 0;

    var ticketType = '"TicketType":"' + this.primeTicketType + '"';
    var ticketStatus = '"TicketStatus":"'
      + (this.selectedStatus ? this.selectedStatus.id : 0)
      + '"';

    var ticketOwner = '"TicketOwnerId":"' + vendorID + '"';
    if (ticketOwner === "") ticketOwner = "0";
    var phoneNumber = $('#eid_customer_phone').val();
    var callNumber = $('#eid_call_number').val();

    localStorage.setItem('status', (this.selectedStatus ? this.selectedStatus.id : 0));
    localStorage.setItem('phone', $('#eid_customer_phone').val());
    localStorage.setItem('callNumber', $('#eid_call_number').val());
    localStorage.setItem('vendor', vendorID);
    localStorage.setItem('customer', TicketMemberId);
    localStorage.setItem('category', FilterId);

    if (callNumber && (typeof callNumber !== 'undefined')) phoneNumber = callNumber;
    if (!phoneNumber || (typeof phoneNumber === 'undefined')) phoneNumber = "";

    var inputData = '"InputData":"' + phoneNumber + '"';
    inputData += ', "TicketMemberId":"' + TicketMemberId.toString() + '"';
    inputData += ', "FilterId":"' + FilterId.toString() + '"';

    return "{" + ticketType + ', ' + ticketStatus + ', ' + ticketOwner + ', ' + inputData + '}'; 
  }


  bindTransactions() {
    for (var i = 0; i < this.status.length; i++) {
      this.status[0].name = this.ugs.uTranslate(this.status[0].name);
    }

    Array.from(document.getElementsByTagName('table')).forEach((table) => {
      var tableRows: any = "";
      if (table.id == 'eid_call_table') {

        while (table.tBodies.length > 0) {
          table.removeChild(table.tBodies[0])
        }

        var tblBody = document.createElement("tbody");
        table.appendChild(tblBody);

        tableRows = this.transactions;

        tableRows.forEach((tableRow) => {
          var row: any = this.createTableRow(table, tableRow);
          var _row_wrap = document.createElement('div');
          _row_wrap.setAttribute('class', 'table-space');
          _row_wrap.style.cssText = 'padding-top: 10px !important;';

          tblBody.appendChild(row);
          tblBody.appendChild(_row_wrap);
        });
      }
    })
  }


  //=================================================================================
  createTableRow(table, json_table_row) {
    var _row = document.createElement('tr');
  _row.style.cssText = 'height:40px !important;';

    Array.from(table.getElementsByTagName('th')).forEach((header: HTMLInputElement) => {
      var _cell = document.createElement('td');
      var direction = localStorage.getItem('direction');
      var textAlign = 'text-align: ' + (direction === 'rtl' ? 'right' : 'left') + ';';

      _cell.style.cssText = 'margin: 0 !important; font-size: larger; font-weight: bold; 3-top: 5px; padding-right: 3px; padding-left: 3px; vertical-align: middle; background-color: white; color: black; ' + textAlign;
      var _label = document.createElement("Label");

      var value = '';
      var bind = header.getAttribute('data-bind');
      if (bind) value = json_table_row[bind];

      if (bind) {
        if (bind === 'TicketStatus') {
          value = this.getTicketStatus(value);
        }
        _label.innerHTML = value;
        _label.classList.add('lbhover')
      }

      _cell.appendChild(_label);
      _row.appendChild(_cell);
    });

    this.appendToolImage(_row, "edit_1.png", this.OnToolClick.bind(this), "Edit_Ticket");
    this.appendToolImage(_row, "customer_1.png", this.OnToolClick.bind(this), "Customer_Info");
    this.appendToolImage(_row, "sms_1.png", this.OnToolClick.bind(this), "Send_Sms");
    this.appendToolImage(_row, "print_1.png", this.OnToolClick.bind(this), "Print_Ticket");
    this.appendToolImage(_row, "history_1.png", this.OnToolClick.bind(this), "Show_History");

    return _row;
  }

  appendToolImage(_row, imgPath, DoClick, hint) {
    var _cell = document.createElement('td');
    _cell.onclick = function () { DoClick(event); };
    _cell.style.cssText = 'margin: 0 !important; padding-right: 8px; padding-left: 8px; vertical-align: middle; background-color: white; color: black; text-align: center;';
    var _icon = document.createElement("img");
    $(_icon).attr('title', this.ugs.uTranslate(hint));
    _icon.src = "/assets/img/" + imgPath;
    _icon.style.cssText = "height: 20px; width: 20px;";

    _cell.appendChild(_icon);
    _row.appendChild(_cell);
  }

  public OnToolClick(event) {
    var cellIndex = event.currentTarget.cellIndex;
    var rowIndex = event.currentTarget.parentNode.rowIndex - 1;
    var rowTable = this.transactions[rowIndex];

    switch (cellIndex - 7) {
      case 0: this.DoEdit(rowTable); break;
      case 1: this.DoCustomerInfo(rowTable); break;
      case 2: this.DoSms(rowTable); break;
      case 3: this.DoPrint(rowTable);
        this.ugs.Loger("Record Successfully printed.....", true);
        break;
      case 4: this.DoHistory(rowTable); break;
    }
  }

  async DoHistory(rowTable) {
    var TicketSysId = rowTable.TicketSysId;
    const result: any = await this.trs.TicketHistory({ TicketSysId });
    //if ((result.ErrorCode !== 0) || (!result.Actions)) {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //  return;
    //}

    this.bindHistory(result);

    $('#eid_history_table tr td').click(this.historyTableClicked.bind(this));

    $('#history-modal').modal();
    $('#history-modal').modal('show');
  }

  OnHistoryDone() {
    $("#history-modal .close").click()
  }


  public DoNewTicket(procedureType) {
    this.router.navigate(['customer-find'], { queryParams: { procedureType } });
  }


  DoEdit(rowTable) {
    var callNumber = rowTable.TicketSysId;
    var customerName = rowTable.MemberName;
    var procedureType = this.primeTicketType === "0" ? "ServiceCalls" : "Orders"; 
    this.router.navigate(['edit-service-call'], { queryParams: { procedureType, callNumber, customerName } });
  }


  async DoCustomerInfo(rowTable) {
    var phoneNumber = rowTable.MemberPhone;

    const result: any = await this.trs.fetchCustomer('{"param":"' + phoneNumber + '", "MemberType":"5"}');
    if ((!result) || (!result.MemberInfo)) return;

    this.router.navigate(['customer-register'], { queryParams: { phoneNumber } });
  }


  DoSms(rowTable) {
    this.TicketPKey = rowTable.TicketSysId;
    $('#send-sms-modal').modal('show');

    $('#about-modal').on('shown.bs.modal', function () {
      $('.df_button_blue').focus();
    })
  }

  async OnSendSmsDone(confirm) {
    var SMSMessage = $('#eid_send_sms_message').val();
    $('#eid_send_sms_message').val("");

    $("#send-sms-modal .close").click()
    if (!confirm) return;

    var TicketSysId = this.TicketPKey;
    const result: any = await this.trs.TicketSendSMS({ SMSMessage, TicketSysId });
    //if (result.ErrorCode !== 0) {
    //  this.ugs.Loger(result.ErrorMessage, true);
    //}
  }


  async OnAboutDone(confirm) {
    $("#about-modal .close").click()
  }

  async DoPrint(rowTable) {
    var TicketSysId = rowTable.TicketSysId;
    const result: any = await this.trs.TicketPrint({ TicketSysId });
    if (result) {
      this.router.navigate(['service-call']);
    }
  }

  public getTicketStatus(value) {
    for (var i = 0; i < this.status.length; i++) {
      if (this.status[i].id == value) return this.status[i].name;
    }
    return '';
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
    var is1 = this.trs.IsAllowViewReports();
    if (is1 === "false") $("#eid_pdf").hide();

    $(document).find('li.serviceCall')[0].style.display = "none";
    $(document).find('li.logout')[0].style.display = "block";

    this.setPageControlValues();
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
          tblBody.appendChild(row);
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


  DoFilter() {
    this.fetchTransactions();    
  }


  public async DoPDF() {
    var query = this.buildQuery();

    const result: any = await this.trs.CreatePDFReport(query);
    if (result) {
      if (this.ugs.deviceDetector.isDesktop()) {
        window.open(result.PDFURL);
      }
      else {
        window.location.href = result.PDFURL;
      }
    }
    //else {
    //  this.ugs.Loger(result.ErrorMessage);
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
