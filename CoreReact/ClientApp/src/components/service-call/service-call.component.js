
import React from 'react';
import { Redirect } from "react-router-dom";
import Select from 'react-select';

import './service-call.component.scss';

import { translate } from '../../lib/services/u-language-codes.service';

import { BaseFormComponent } from '../../lib/templates/BaseFormComponent';
import { InputRow } from '../../lib/templates/input-row.component';
import { AddressRow } from '../../lib/templates/address-row';
import { PhoneRow } from '../../lib/templates/phone-row.component';
import { DateRow } from '../../lib/templates/date-row.component';
import { ButtonRow } from '../../lib/templates/button-row.component';
import { Fileupload } from '../../lib/templates/fileupload'

import * as $ from 'jquery';
import * as moment from 'moment';
import '../service-call/splitter.css'
import * as splitter from '../service-call/splitter';

export class ServiceCallComponent extends BaseFormComponent {

	state = {
		selectedYear: {},
		selectedMonth: {},
		redirect: null,
		isConfirmed: false
	};

	month = [];
	year = [];
	initDone = false;

	constructor(props) {
		super(props);

		this.componentDidMount = this.componentDidMount.bind(this);
		this.UNSAFE_componentWillMount = this.UNSAFE_componentWillMount.bind(this);
		this.doShoppingCart = this.doShoppingCart.bind(this);
		this.doCreditPayment = this.doCreditPayment.bind(this);

		var value, label;
		var i;
		for (i = 0; i < 8; i++) { value = label = (i + moment().year()); this.year.push({ value, label }) }
		for (i = 1; i <= 12; i++) { value = label = i; this.month.push({ value, label }) }
	}

	//=================================================================================
	async componentDidMount() {
		var splitterX = splitter;
		splitterX.dragElement(document.getElementById("seperator"), "H");

		const elem = document.getElementsByClassName('servicecall');
		if (elem && elem.style) elem[0].style.display = "none";

		this.setsScreenProperties();

		this.ufw.ServiceCall(ServiceCallResponse)

		const self = this;
		function ServiceCallResponse(response) {
			self.getFormData(response, false);
		}
	}

	//=================================================================================
	UNSAFE_componentWillMount() {
		var elem = $(document).find('NavItem.servicecall');
		if (elem && elem.style) {
			elem[0].style.display = "block";
		}
	}
	//=================================================================================
	async getFormData(scData, autoUpdate) {

		const query = new URLSearchParams(this.props.location.search);

		this.udb.view_key_value = query.get('view_key_value');
		this.udb.recordPosition = parseInt(query.get('view_position'));
		this.udb.view_tab = parseInt(query.get('view_tab'));

		if (!this.udb.recordPosition || (this.udb.recordPosition < 0)) this.udb.recordPosition = 0;
		if (!this.udb.view_tab || (this.udb.view_tab < 0)) this.udb.view_tab = 0;
		this.formInit(scData, autoUpdate, this, ".rframe");

		const self = this;

		if (this.udb.view_tab) this.udb.selectTab('.nav-tabs', this.udb.view_tab);

		$('#eid_cart_table').on('click', 'tr', this.doShoppingCart.bind(this));

		$('input.clicked[type="button"]').on('click', this.serviceCallStep.bind(this));

		$('.nav li').click(function (ev) {
			ev.preventDefault();

			var el = this;
			for (var tab = 1; el = el.previousElementSibling; tab++);

			self.udb.selectTab('.nav-tabs', tab);
		});

		$('.cameraFrame').click(function ($event) {
			var callerInput = this.getElementsByTagName('input')[0];
			if (callerInput === null) return;

			callerInput.click();
		});

		$('.cameraFrame input').change(async function ($event) {
			var file = (this).files[0];
			if (!file) return;

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

			reader.readAsDataURL(file);
			var remoteFileName = this.getAttribute('data-file');
			var remoteFilePath = self.udb.primary_dataset.dataset_content[self.udb.recordPosition]['Files_Folder'] + '/' + remoteFileName;

			await self.ufw.uploadFile(file, remoteFilePath);
		});
	}

	//=================================================================================
	afterBinding() {
		var source = this.udb.primary_dataset.dataset_content[this.udb.recordPosition].Source_Latlng;
		this.gmap.mapDrawRoute(source);

		this.setTotalPayment();
		this.setCreditTransactionElements();
	}


	//=================================================================================
	serviceCallStep() {
		var elmInput = $(":input")[$(":input").index(document.activeElement) + 1];

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
		const message = this.ugs.uTranslate("SMS_Arrival_Cancelled")
			.replace("000", this.udb.primary_dataset.dataset_content[this.udb.recordPosition].Vehicle_ID);
		this.ufw.SendSMS(recipient, message);
	}


	//=================================================================================
	sendOnMyWay_SMS() {
		const recipient = "0524871400";
		// recipient = this.udb.primary_dataset.dataset_content[this.udb.record_position].Contact_Phone_1;
		const message = this.ugs.uTranslate("SMS_On_My_Way")
			.replace("000", this.udb.primary_dataset.dataset_content[this.udb.recordPosition].Vehicle_ID)
			.replace("111", this.gmap.duration);
		this.ufw.SendSMS(recipient, message);
	}

	//=================================================================================
	doShoppingCart(event) {
		const view_key_value = this.udb.primary_dataset.dataset_content[this.udb.recordPosition]['Work_Order_PKey'];
		const view_position = (event.currentTarget.rowIndex).toString();
		const parent_key_value = this.udb.view_key_value;
		const parent_view = 'servicecallX';
		const parent_position = this.udb.recordPosition.toString();
		const parent_tab = '5';

		const url = `/shopingcard?`
			+ `view_key_value=${view_key_value}&`
			+ `view_position=${view_position}&`
			+ `parent_key_value=${parent_key_value}&`
			+ `parent_view=${parent_view}&`
			+ `parent_position=${parent_position}&`
			+ `parent_tab=${parent_tab}`;

		this.setState({
			redirect: url
		});
	}


	//=================================================================================
	doCreditPayment() {
		const uiConfNo = document.getElementById("eid_confirmation_number");
		if (uiConfNo === null) {
			console.log("doCreditPayment null uiConfNo")
		}
		let confNo = this.udb.getElementInputValue(uiConfNo);
		if (confNo) return;

		uiConfNo.value = confNo = "";
		if (!this.validateCreditTransactionElements()) return;

		const cardNumber = this.udb.getElementInputValue(document.getElementById('eid_card_number')); // "4580170000827965"; //
		const firstName = this.udb.getElementInputValue(document.getElementById('eid_card_first_name')); // "שלמה"; //
		const lastName = this.udb.getElementInputValue(document.getElementById('eid_card_last_name')); // "אביב"; //
		//let expiredYear		= this.udb.getElementInputValue(document.getElementById('eid_expiration_year')).toString();
		let expiredYear = this.state.selectedYear.value.toString();
		expiredYear = expiredYear.substring(2, 4);
		//let expiredMonth			= this.udb.getElementInputValue(document.getElementById('eid_expiration_month')).toString();
		let expiredMonth = this.state.selectedMonth.value.toString();
		while (expiredMonth.length < 2) expiredMonth = "0" + expiredMonth;

		const cvv = this.udb.getElementInputValue(document.getElementById('eid_cvv_code')); // "587"; //
		const holderID = this.udb.getElementInputValue(document.getElementById('eid_id_number')); // "054572904"; //

		//const billAmount	= $("#eid_total_payment").val();
		const billAmount = "1";
		const payments = "1";

		const transType = "CreditPayment"; // "AuthorizeCredit"

		this.ufw.CreditAction(CreditPaymentResponse, transType, holderID, cardNumber, expiredYear, expiredMonth,
			billAmount, payments, cvv, holderID, firstName, lastName);

		var self = this;
		function CreditPaymentResponse(response) {
			if (!response) return;

			const confirmed = response.confirmationNo;
			const issuerID = response.issuerID;
			const terminalID = response.TerminalID;
			const rExpired = response.expired;

			const message = self.ugs.uTranslate("Ccard_Successfully_Confirmed")
				+ `: ConfirmatioNo=${confirmed} issuer=${issuerID}, terminal=${terminalID}, expired=${rExpired}`;

			self.ugs.Loger(message, true);

			const uiConfNo = document.getElementById("eid_confirmation_number");
			uiConfNo.value = confirmed;

			self.setCreditTransactionElements();
		}
	}


	//=================================================================================
	validateCreditTransactionElements() {
		if (!this.udb.checkForRequired('eid_card_number')) return false;
		if (!this.udb.checkForRequired('eid_card_first_name')) return false;
		if (!this.udb.checkForRequired('eid_card_last_name')) return false;
		if (!this.state.selectedMonth.value) return this.udb.checkForRequired('eid_expiration_month');
		if (!this.state.selectedYear.value) return this.udb.checkForRequired('eid_expiration_year');
		//if (!this.udb.checkForRequired('eid_expiration_month')) return false;
		//if (!this.udb.checkForRequired('eid_expiration_year')) return false;
		if (!this.udb.checkForRequired('eid_cvv_code')) return false;
		if (!this.udb.checkForValidity('eid_id_number', this.udb.checkForLegalIsraelIDCard)) return false;

		if (!$("#eid_total_payment").val()) {
			this.ugs.Loger(this.ugs.uTranslate("msg_no_value") + ": " + this.ugs.uTranslate("Total_Payment"), true);
			return false;
		}

		return true;
	}


	//=================================================================================
	setCreditTransactionElements() {
		const elm_isConfirmed = document.getElementById('eid_confirmation_number');
		if (!elm_isConfirmed) return;

		const isConfirmed = (elm_isConfirmed).value ? true : false;
		
		document.getElementById("eid_btn_payment").style.backgroundColor = isConfirmed ? "lightgray" : "#007bff";
		this.setState({ isConfirmed: isConfirmed });

	}


	//=================================================================================
	setTotalPayment() {
		const dataset = this.udb.getDataset("VU_Cart_Detail_Line_Extended");
		if (!dataset) return;

		const tableRows = this.udb.getDatasetRowsArray("VU_Cart_Detail_Line_Extended",
			dataset.foreign_key_field,
			this.udb.primary_dataset.dataset_content[this.udb.recordPosition][dataset.parent_key_field]);

		let totalPayment = 0;
		for (let i = 0; i < tableRows.length; i++) {
			totalPayment += parseFloat(tableRows[i].Cart_Row_Total_Price);
		}

		$("#eid_total_payment").val(totalPayment.toLocaleString('he', { style: 'currency', currency: 'ILS' }));
	}


	//=================================================================================
	getSelectedValue(eid_element) {
		if (eid_element === 'eid_expiration_month')
			return (this.state.selectedMonth ? this.state.selectedMonth.id : '');

		if (eid_element === 'eid_expiration_year')
			return (this.state.selectedYear ? this.state.selectedYear.id : '');

		return '';
	}
	//
	handleChangeMonth = selectedMonth => {
		this.setState({ selectedMonth: selectedMonth });
	};

	handleChangeYear = selectedYear => {
		this.setState({ selectedYear: selectedYear });
	};


	//=================================================================================
	getSelectedLabel(eid_element) {
		if (eid_element.id === 'eid_expiration_month')
			return (this.month ? this.month[0].name : '');

		if (eid_element.id === 'eid_expiration_year')
			return (this.year ? this.year[0].name : '');

		return '';
	}

	render()
	{
		if (this.state.redirect) {
			return <Redirect to={this.state.redirect} />
		}

		const { selectedMonth } = this.state.selectedMonth;
		const { selectedYear } = this.state.selectedYear;

		return (
			<div className="main_frame">
				<div className="splitter">
					<div id="first">
						<div className="lframe">
							<div className="main_grid_wraper form-horizontal">
								<table id="eid_main_table" className="main_grid" data-bind="Work_Orders">
									<thead>
										<tr>
											<th className="width10" data-bind="Work_Order_ID">
												<label>{translate('Work_Order_ID')}</label>
											</th>
											<th className="width135" data-bind="Work_Order_Time_Created">
												<label>{translate('Work_Order_Time_Created')}</label>
											</th>
											<th className="width15" data-bind="Technician_Name">
												<label>{translate('Technician_Name')}</label>
											</th>
											<th className="width15" data-bind="Contact_Name">
												<label>{translate('Contact_Name')}</label>
											</th>
											<th className="width30" data-bind="Source_Addr">
												<label>{translate('Source_Addr')}</label>
											</th>
										</tr>
									</thead>
								</table>
							</div>
						</div>
					</div>
					<div id="seperator"></div>
					<div id="second">
						<div className="rframe" id=".rframe">
							<div className="tabs-container">
								<ul id="main_nav_tabs" className="nav nav-tabs">
									<li className="active">
										<a href="#tab1" data-toggle="tab">
											<span className="fa fa-info-circle"></span>  {translate('Details')}
										</a>
									</li>
									<li>
										<a href="#tab2" data-toggle="tab">
											<span className="fa fa-map-marker"></span>  {translate('Location')}
										</a>
									</li>
									<li>
										<a href="#tab3" data-toggle="tab">
											<span className="fa fa-clock-o"></span>  {translate('Schedule')}
										</a>
									</li>
									<li>
										<a href="#tab4" data-toggle="tab">
											<span className="fa fa-image"></span>  {translate('Camera')}
										</a>
									</li>
									<li>
										<a href="#tab5" data-toggle="tab">
											<span className="fa fa-cart-plus"></span>  {translate('Products')}
										</a>
									</li>
									<li>
										<a href="#tab6" data-toggle="tab">
											<span className="fa fa-credit-card"></span>  {translate('Charge')}
										</a>
									</li>
									<li>
										<a href="#tab7" data-toggle="tab">
											<span className="fa fa-map"></span>  {translate('Map')}
										</a>
									</li>
								</ul>
							</div>
							<div id="tab-content" className="tab-content">
								<div className="active tab-pane tframe" id="tab1">
									<div className="form-horizontal">
										<InputRow label='Contact_Name' elementID='Contact_Name' boundColumn='Contact_Name' icon='fa fa-user' isReadOnly='true'></InputRow>
										<InputRow label='Vehicle_Model' elementID='Model' boundColumn='Model' icon='fa fa-car' isReadOnly='true'></InputRow>
										<InputRow label='Vehicle_Type' elementID='Vehicle_Type' boundColumn='Vehicle_Type' icon='fa fa-font' isReadOnly='true'></InputRow>
										<InputRow label='Description' elementID='Description' boundColumn='Description' icon='fa fa-eye' isReadOnly='true'></InputRow>
										<InputRow label='Malf' elementID='Malf_Desc' boundColumn='Malf_Desc' icon='fa fa-unlink' isReadOnly='true'></InputRow>
										<InputRow label='Call_Number' elementID='Work_Order_ID' boundColumn='Work_Order_ID' icon='fa fa-list-ol' isReadOnly='true'></InputRow>
									</div>
								</div>
								<div className="tab-pane tframe" id="tab2">
									<div className="form-horizontal">
										<PhoneRow label='Contact_Phone_1' elementID='Contact_Phone_1' boundColumn='Contact_Phone_1' icon='fa fa-phone'></PhoneRow>
										<PhoneRow label='Contact_Phone_2' elementID='Contact_Phone_2' boundColumn='Contact_Phone_2' icon='fa fa-phone'></PhoneRow>
										<PhoneRow label='Contact_Phone_3' elementID='Contact_Phone_3' boundColumn='Contact_Phone_3' icon='fa fa-phone'></PhoneRow>
										<AddressRow label='Address' elementID='Source_Addr' boundColumn='Source_Addr' icon='fa fa-location-arrow'></AddressRow>
										<InputRow label='Description' elementID='Source_Desc' boundColumn='Source_Desc' icon='fa fa-eye'></InputRow>
										<AddressRow label='Address' elementID='Destination_Addr' boundColumn='Destination_Addr' icon='fa fa-location-arrow'></AddressRow>
										<InputRow label='Description' elementID='Destination_Desc' boundColumn='Destination_Desc' icon='fa fa-eye'></InputRow>
									</div>
								</div>
								<div className="tab-pane tframe" id="tab3">
									<div className="form-horizontal">
										<DateRow label='From_Time' elementID='From_Coordinated_Time' boundColumn='From_Coordinated_Time' isReadOnly="false" local={this.ugs.languageCodes.currentLanguage}></DateRow>
										<DateRow label='To_Time' elementID='To_Coordinated_Time' boundColumn='To_Coordinated_Time' isReadOnly="false" local={this.ugs.languageCodes.currentLanguage}></DateRow>
										<ButtonRow label='On_My_Way' elementID='On_My_Way_Time' boundColumn='On_My_Way_Time' icon='fa fa-thumbs-o-up'></ButtonRow>
										<ButtonRow label='Got_There' elementID='Got_There_Time' boundColumn='Got_There_Time' icon='fa fa-play'></ButtonRow>
										<ButtonRow label='Leave' elementID='Leave_Time' boundColumn='Leave_Time' icon='fa fa-dot-circle-o'></ButtonRow>
										<ButtonRow label='Done' elementID='Done_Time' boundColumn='Done_Time' icon='fa fa-check-square-o'></ButtonRow>
									</div>
								</div>
								<div className="tab-pane tframe" id="tab4">
									<div className="form-horizontal">
										<div className="row form-group col-12" style={{ textAlign: 'center' }}>
											<label className="col-4 label-align-opposite" style={{ fontSize: 18 }} >{translate('Got_There')}</label>
										</div>
										<Fileupload datafile="Before1" />
										<Fileupload datafile="Before2" />
										<Fileupload datafile="Before3" />
										<Fileupload datafile="After1" />
										<Fileupload datafile="After2" />
										<Fileupload datafile="After3" />

									</div>
								</div>
								<div className="tab-pane tframe" id="tab5">
									<div id="eid_cart_wraper" className="form-horizontal">
										<table id="eid_cart_table" data-bind="VU_Cart_Detail_Line_Extended">
											<thead>
												<tr>
													<th className="width10" data-bind="Product_Name">
														<label>{translate('Product_Name')}</label>
													</th>
													<th className="width35" data-bind="Product_Desc">
														<label>{translate('Product_Desc')}</label>
													</th>
													<th className="width15 width10" data-bind="Product_Sale_Price">
														<label>{translate('Product_Sale_Price')}</label>
													</th>
													<th className="width15" data-bind="Product_Sale_Quantity">
														<label>{translate('Product_Unit_Quantity')}</label>
													</th>
													<th className="width15" data-bind="Cart_Row_Total_Price">
														<label>{translate('Cart_Row_Total_Price')}</label>
													</th>
												</tr>
											</thead>
										</table>
									</div>
								</div>
								<div className="tab-pane tframe" id="tab6">
									<div className="form-horizontal">
										<InputRow label='CCard_Number' elementID='eid_card_number' isReadOnly={this.state.isConfirmed.toString()} icon='fa fa-credit-card'></InputRow>

										<div className="row form-group col-12">
											<label className="col-4 col-form-label label-align-opposite" >{translate('CCard_Owner')} </label>
											<div className="col-4">
												<input type="text" className="form-control r_input" placeholder={translate('First_Name')} id="eid_card_first_name" readOnly={this.state.isConfirmed} />
											</div>
											<div className="col-4">
												<input type="text" className="form-control" placeholder={translate('Last_Name')} id="eid_card_last_name" readOnly={this.state.isConfirmed} />
											</div>
										</div>
										<div className="row form-group col-12">
											<label className="col-4 col-form-label label-align-opposite">{translate('Expiration_Date')}</label>
											<div className="col-4">
												<Select id='eid_expiration_month' placeholder={translate('Month')}
													value={selectedMonth}
													isDisabled={this.state.isConfirmed}
													onChange={this.handleChangeMonth}
													options={this.month} />
											</div>
											<div className="col-4">
												<Select id='eid_expiration_year' placeholder={translate('Year')}
													value={selectedYear}
													onChange={this.handleChangeYear}
													isDisabled={this.state.isConfirmed}
													options={this.year} />
											</div>
										</div>
									</div>
									<div className="row form-group col-12">
										<label className="col-4 col-form-label label-align-opposite">{translate('CVV_Code')}</label>
										<div className="col-8">
											<div className="input-group">
												<input type="tel" id="eid_cvv_code" className="form-control r_input"
													placeholder={translate('Last_3_Digits')} readOnly={this.state.isConfirmed} />
												<span className="input-group-addon"><i className="fa fa-key icon-align-opposite" aria-hidden="true"></i></span>
											</div>
										</div>
									</div>
									<InputRow label='Identity_Card' elementID='eid_id_number' icon='fa fa-id-card-o' isReadOnly={this.state.isConfirmed.toString()}></InputRow>
									<InputRow label='Total_Payment' elementID='eid_total_payment' icon='fa fa-money' disabled='true'></InputRow>
									<div className="row form-group col-12">
										<div className="col-4">
											<div className="input-group">
												<input type="button" className="btn btn-primary btn-block r_input"
													value={translate('Do_Payment')} onClick={this.doCreditPayment}
													id="eid_btn_payment" disabled={this.state.isConfirmed} />
												<span className="input-group-addon">
													<i className="fa fa-check-square-o icon-align-opposite" style={{ color: "white" }} aria-hidden="true"></i>
												</span>
											</div>
										</div>
										<div className="col-8">
											<div className="input-group">
												<input id="eid_confirmation_number"
													className="form-control r_input"
													placeholder={translate('Confirmation_Number')}
													readOnly />
												<span className="input-group-addon"><i className="fa fa-check-square-o icon-align-opposite" aria-hidden="true"></i></span>
											</div>
										</div>
									</div>
								</div>
								<div className="tab-pane tframe" style={{ paddingTop: 0 }} id="tab7">
									<div className="form-horizontal">
										<div id="container-fluid">
											<div className="col-xs-12" id="mapcanvas"></div>
										</div>
									</div>
								</div>
							</div>
							<div id="navigatebar">
							</div>
						</div>
					</div>
				</div>
			</div >
		);
	}
}
