
import { Component, AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { BaseFormComponent } from '../../../../angular-toolkit/src/public-api';

import * as $ from 'jquery';
declare var $: any;

import * as moment from 'moment';

@Component({
	selector: 'app-service-call',
	templateUrl: './service-call.component.html',
	styleUrls: ['./service-call.component.scss']
})

export class ServiceCallComponent  extends BaseFormComponent implements AfterViewInit, OnDestroy {

	month: any = [];
	selectedMonth: any;

	year: any = [];
	selectedYear: any

	initDone: boolean = false;

	constructor(injector: Injector) {
		super(injector);

		let id, name;
		for (let i = 0; i < 8; i++) { id = name = (i + moment().year()); this.year.push({ id, name }) }
		for (let i = 1; i <= 12; i++) { id = name = i; this.month.push({ id, name }) }

    this.year.splice(0, 0, { id: '', name: this.ugs.locale.uTranslate("Year") });
    this.month.splice(0, 0, { id: '', name: this.ugs.locale.uTranslate("Month") });
		this.selectedYear = this.year[0];
		this.selectedMonth = this.month[0];

    this.getFormData();
  }


 async ngAfterViewInit() {
    super.setsScreenProperties();
    $(document).find('li.servicecall')[0].style.display = "none";
  }


	//=================================================================================
	ngOnDestroy(): void {
		$(document).find('li.servicecall')[0].style.display = "block";
	}


	//=================================================================================
	public async getFormData() {
    const response = await this.ufw.get('ServiceCall');

    this.udb.view_key_value = this.ugs.queryParam("view_key_value");
		this.udb.recordPosition = parseInt(this.ugs.queryParam("view_position"));
		this.udb.view_tab = parseInt(this.ugs.queryParam("view_tab"));

		if (!this.udb.recordPosition || (this.udb.recordPosition < 0)) this.udb.recordPosition = 0;
		if (!this.udb.view_tab || (this.udb.view_tab < 0)) this.udb.view_tab = 0;

		super.formInit(response, false, ".rframe");

		if (this.udb.view_tab) this.udb.selectTab('.nav-tabs', this.udb.view_tab);

		$('#eid_cart_table').on('click', 'tr', this.doShoppingCart.bind(this));

		$('input.clicked[type="button"]').on('click', this.serviceCallStep.bind(this));

    const self = this;
		$('.nav li').click(function () {
			event.preventDefault();

      let el = this;
      let tab;
			for (tab = 1; el = el.previousElementSibling; tab++);

			self.udb.selectTab('.nav-tabs', tab);
		});

		$('.cameraFrame').click(function () {
			const callerInput = this.getElementsByTagName('input')[0];
			if (callerInput === null) return;

			callerInput.click();
		});

		$('.cameraFrame input').change(function () {
			const file = this.files[0];
			if (!file) return;

			const callerCam = this.parentElement;
			const callerImage = callerCam.getElementsByTagName('div')[0];
			const callerFa = callerCam.getElementsByTagName('i')[0];

			callerFa.style.display = 'none';
			callerImage.style.display = 'block';

			const reader = new FileReader();
			reader.onloadend = function () {
				callerImage.style.background = 'url("' + reader.result + '")';
				callerImage.style.backgroundSize = "cover";
			}

			reader.readAsDataURL(file);
			const remoteFileName = this.getAttribute('data-file');
			const remoteFilePath = self.udb.primaryDataset.dataset_content[self.udb.recordPosition]['Files_Folder'] + '/' + remoteFileName;
			self.ufw.uploadFile(file, remoteFilePath);
		});
	}


	//=================================================================================
	afterBinding() {
		const source = this.udb.primaryDataset.dataset_content[this.udb.recordPosition].Source_Latlng;
		this.gmaps.mapDrawRoute(source);

		this.setTotalPayment();
		this.setCreditTransactionElements();
	}


	//=================================================================================
	serviceCallStep() {
		const elmInput = $(":input")[$(":input").index(document.activeElement) + 1] as HTMLInputElement;

		if (!elmInput.value)
			elmInput.value = moment().format('YYYY/MM/DD HH:mm');
		else
			elmInput.value = '';

		if (elmInput.id !== "On_My_Way_Time") return;

		if (!elmInput.value) {
			this.sendArrivalCancel_SMS();
			return;
		}

		this.sendOnMyWay_SMS(); // NEW
	}


	//=================================================================================
	sendArrivalCancel_SMS() {
		const recipient = "0544719547";
		// recipient = this.udb.primary_dataset.dataset_content[this.udb.record_position].Contact_Phone_1;
    const message = this.ugs.locale.uTranslate("SMS_Arrival_Cancelled")
		.replace("000", this.udb.primaryDataset.dataset_content[this.udb.recordPosition].Vehicle_ID);
		this.ufw.SendSMS(recipient, message);
	}


	//=================================================================================
	sendOnMyWay_SMS() {
		const recipient = "0544719547";
		// recipient = this.udb.primary_dataset.dataset_content[this.udb.record_position].Contact_Phone_1;
    const message = this.ugs.locale.uTranslate("SMS_On_My_Way")
		.replace("000", this.udb.primaryDataset.dataset_content[this.udb.recordPosition].Vehicle_ID)
		.replace("111", this.gmaps.duration);
		this.ufw.SendSMS(recipient, message);
	}


	//=================================================================================
	doShoppingCart(event) {
		const view_key_value = this.udb.primaryDataset.dataset_content[this.udb.recordPosition]['Work_Order_PKey'];
		const view_position = (event.currentTarget.rowIndex).toString();
		const parent_key_value = this.udb.view_key_value;
		const parent_view = 'service-call';
		const parent_position = this.udb.recordPosition.toString();
		const parent_tab = '5';

		this.router.navigate(['shopping-cart'], {
			queryParams: {
				view_key_value, view_position, parent_key_value, parent_view, parent_position, parent_tab
			}
		});
	}


	//=================================================================================
	public async doCreditPayment() {
		const uiConfNo = document.getElementById("eid_confirmation_number") as HTMLInputElement;
		let confNo = this.udb.getElementInputValue(uiConfNo);
		if (confNo) return;

		uiConfNo.value = confNo = "";

		if (!this.validateCreditTransactionElements()) return;

		const cardNumber	= this.udb.getElementInputValue(document.getElementById('eid_card_number')); // "4580170000827965"; //
		const firstName		= this.udb.getElementInputValue(document.getElementById('eid_card_first_name')); // "שלמה"; //
		const lastName		= this.udb.getElementInputValue(document.getElementById('eid_card_last_name')); // "אביב"; //
		let expiredYear			= this.udb.getElementInputValue(document.getElementById('eid_expiration_year')).toString();
		expiredYear = expiredYear.substring(2, 4);
		let expiredMonth			= this.udb.getElementInputValue(document.getElementById('eid_expiration_month')).toString();
		while (expiredMonth.length < 2) expiredMonth = "0" + expiredMonth;

		const cvv			= this.udb.getElementInputValue(document.getElementById('eid_cvv_code')); // "587"; //
		const holderID		= this.udb.getElementInputValue(document.getElementById('eid_id_number')); // "054572904"; //

		//const billAmount	= $("#eid_total_payment").val();
		const billAmount	= "1";
		const payments		= "1";

		const transType = "CreditPayment"; // "AuthorizeCredit"

		const response: any = await this.ufw.CreditAction(transType, holderID, cardNumber, expiredYear, expiredMonth,
							billAmount, payments, cvv, holderID, firstName, lastName);

		if (!response) return;

		const confirmed = response.confirmationNo;
		const issuerID = response.issuerID;
		const terminalID = response.TerminalID;
		const rExpired = response.expired;

    const message = this.ugs.locale.uTranslate("Ccard_Successfully_Confirmed")
			+ `: ConfirmatioNo=${confirmed} issuer=${issuerID}, terminal=${terminalID}, expired=${rExpired}`;

		this.ugs.Loger(message, true);

		uiConfNo.value = confirmed;

		this.setCreditTransactionElements();
	}


	//=================================================================================
	validateCreditTransactionElements() {
		if (!this.udb.checkForRequired('eid_card_number')) return false;
		if (!this.udb.checkForRequired('eid_card_first_name')) return false;
		if (!this.udb.checkForRequired('eid_card_last_name')) return false;
		if (!this.udb.checkForRequired('eid_expiration_month')) return false;
		if (!this.udb.checkForRequired('eid_expiration_year')) return false;
		if (!this.udb.checkForRequired('eid_cvv_code')) return false;
		if (!this.udb.checkForValidity('eid_id_number', this.udb.checkForLegalIsraelIDCard)) return false;

		if (!$("#eid_total_payment").val()) {
      this.ugs.Loger(this.ugs.locale.uTranslate("msg_no_value") + ": " + this.ugs.locale.uTranslate("Total_Payment"), true);
			return false;
		}

		return true;
	}


	//=================================================================================
	setCreditTransactionElements() {
		const elmIsConfirmed = document.getElementById('eid_confirmation_number');
		if (!elmIsConfirmed) return;

		const isConfirmed = (elmIsConfirmed as HTMLInputElement).value ? true : false;

		(document.getElementById('eid_card_number') as HTMLInputElement).readOnly = isConfirmed;
		(document.getElementById('eid_card_first_name') as HTMLInputElement).readOnly = isConfirmed;
		(document.getElementById('eid_card_last_name') as HTMLInputElement).readOnly = isConfirmed;
		(document.getElementById('eid_cvv_code') as HTMLInputElement).readOnly = isConfirmed;
		(document.getElementById('eid_id_number') as HTMLInputElement).readOnly = isConfirmed;
		(document.getElementById('eid_btn_payment') as HTMLInputElement).disabled = isConfirmed;
		(document.getElementById('eid_total_payment') as HTMLInputElement).disabled = true;

		document.getElementById("eid_expiration_month").style.backgroundColor = isConfirmed ? "lightgray" : "white";
		document.getElementById("eid_expiration_year").style.backgroundColor = isConfirmed ? "lightgray" : "white";
		document.getElementById("eid_btn_payment").style.backgroundColor = isConfirmed ? "lightgray" : "#007bff";
	}


	//=================================================================================
	setTotalPayment() {
		const dataset = this.udb.getDataset("VU_Cart_Detail_Line_Extended");
		if (!dataset) return;

		const tableRows = this.udb.getDatasetRowsArray("VU_Cart_Detail_Line_Extended",
			dataset.foreign_key_field,
			this.udb.primaryDataset.dataset_content[this.udb.recordPosition][dataset.parent_key_field]);

		let totalPayment = 0;
		for (let i = 0; i < tableRows.length; i++) {
			totalPayment += parseFloat(tableRows[i].Cart_Row_Total_Price);
		}

		$("#eid_total_payment").val(totalPayment.toLocaleString('he', { style: 'currency', currency: 'ILS' }));
	}


	//=================================================================================
	public getSelectedValue(eidElement) {
		if (eidElement === 'eid_expiration_month')
			return (this.selectedMonth ? this.selectedMonth.id : '');

		if (eidElement === 'eid_expiration_year')
			return (this.selectedYear ? this.selectedYear.id : '');

		return '';
	}


	//=================================================================================
	public getSelectedLabel(eidElement) {
		if (eidElement.id === 'eid_expiration_month')
			return (this.month ? this.month[0].name : '');

		if (eidElement.id === 'eid_expiration_year')
			return (this.year ? this.year[0].name : '');

		return '';
	}
}
