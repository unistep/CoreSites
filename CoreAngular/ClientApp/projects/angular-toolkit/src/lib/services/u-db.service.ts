
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { UfwInterface } from './ufw-interface';
import { ULocalization } from './u-localizaion.service';

import * as moment from 'moment';

import * as $ from 'jquery';
declare var $: any;

@Injectable()
export class UDbService {

	public view_key_value = "";
	public recordPosition = 0;
	public view_tab = 0;

	public primaryDataset = null;

	public onBinding = false;
	public autoUpdate = false;
	public datasets: any = "";

	public context: any;

  constructor(public locale: ULocalization, public ufw: UfwInterface, public router: Router) {
	}


	//=================================================================================
	selectTab(className, tab) { 	//tabindex start at 0 
		$(className + ' li').removeClass('active');
		$('.tab-content .tab-pane').removeClass('active');

		$('a[href="#tab' + tab + '"]').closest('li').addClass('active');
		$('#tab' + tab).addClass('active');
	}


	//=================================================================================
	prepareDatasets(businessObject) {

		this.datasets = businessObject.datasets;
		if (!this.datasets) return;

		for (let i = 0; i < this.datasets.length; i++) {
			this.datasets[i].dataset_format = JSON.parse(this.datasets[i].dataset_format);
			this.datasets[i].dataset_content = JSON.parse(this.datasets[i].dataset_content);
		}

		this.primaryDataset = this.datasets[0];

		if (this.primaryDataset.dataset_content.length === 0) {
			this.createNewPrimaryRow();
		}

		if (this.recordPosition > this.primaryDataset.dataset_content.length - 1)
			this.recordPosition = this.primaryDataset.dataset_content.length - 1;
	}


	//=================================================================================
	createNewPrimaryRow() {
		const newRow = {};

		for (let key in this.primaryDataset.dataset_format[0]) {
			newRow[key] = '';
		}

		newRow['__State'] = '1';
		this.primaryDataset.dataset_content.push(newRow);
	}


	//=================================================================================
	genericActionsExit() {
		this.genericActions('Exit');
	}


	//=================================================================================
	genericActions(action) {
		if (action) {
			if (action.includes("New")) {
				this.onNewRecordEvent();
				return false;
			}
			if (action.includes("Delete")) {
				this.onDeleteRecordEvent();
				return false;
			}
			if (action.includes("Exit")) {
				this.onBackToCallerEvent();
				return false;
			}
		}

		return true;
	}


	//=================================================================================
	bindData(caller?) {
		if (caller) this.context = caller;

		const elementNavpos = document.getElementById('eid_nav_position');
		if (elementNavpos) {
			const navpos = (this.recordPosition + 1).toString() + " / " + this.primaryDataset.dataset_content.length.toString();
			(elementNavpos as HTMLInputElement).value = navpos;
		}

		this.onBinding = true;

		if (this.context && (typeof this.context.beforeBinding !== 'undefined' && typeof this.context.beforeBinding === 'function')) {
			this.context.beforeBinding();
		}

		this.bindInputs();
		this.bindPhones();
		this.bindAddresses();
		this.bindTables();
		this.bindSelects();

		if (this.context && (typeof this.context.afterBinding !== 'undefined' && typeof this.context.afterBinding === 'function')) {
			this.context.afterBinding();
		}

		this.onBinding = false;

		this.setNavigationButtonsBehavior();
	}


	//=================================================================================
	bindSelects() {
		var value = '';

		Array.from(document.getElementsByTagName('ng-select')).forEach((select) => {

			var dataset_name = select.getAttribute('data-dataset');
			if (dataset_name) {
				this.context.setSelectionList(select, dataset_name);
			}

			var bind = select.getAttribute('data-bind');
			if (bind) {
				value = this.primaryDataset.dataset_content[this.recordPosition][bind];
				if (!value) value = '';
				this.context.setSelectedValue(select.id, value);
			}
		})
	}


  //=================================================================================
	bindTables() {
		Array.from(document.getElementsByTagName('table')).forEach((table) => {
			var tableRows: any = "";

			var dataset_name = table.getAttribute('data-bind');
			if (dataset_name) {
				var dataset = this.getDataset(dataset_name);
				if (dataset) {
					while (table.tBodies.length > 0) {
						if (table.id === 'eid_main_table') return;
						table.removeChild(table.tBodies[0])
					}

					var tblBody = document.createElement("tbody");
					table.appendChild(tblBody);

          if ((table.id !== 'eid_main_table') && (dataset.foreign_key_field)) {
						var parentKeyField = this.primaryDataset.dataset_content[this.recordPosition][dataset.parent_key_field];
						tableRows = dataset.dataset_content.filter(item => {
							return item[dataset.foreign_key_field] === parentKeyField
						});
					}
					else {
						tableRows = dataset.dataset_content;
					}

					tableRows.forEach((tableRow) => {
						var row = this.createTableRow(table, tableRow);
						tblBody.appendChild(row);
					});
				}
			}
		})
	}


	//=================================================================================
	createTableRow(table, json_table_row) { // ??
		var _row = document.createElement('tr');

		Array.from(table.getElementsByTagName('th')).forEach((header: HTMLInputElement) => {
			var _cell = document.createElement('td');
			_cell.style.cssText = 'margin: 0 !important; padding-right: 3px; padding-left: 3px; border: solid 1px gray; vertical-align: middle; background-color: white; color: black';
			var _label = document.createElement("Label");

			var bind = header.getAttribute('data-bind');
			if (bind && json_table_row[bind]) {
				_label.innerHTML = json_table_row[bind];
			}

			_cell.appendChild(_label);
			_row.appendChild(_cell);
		});

		return _row;
	}


	//=================================================================================
	getDataset(dataset_name) {
		if (this.datasets) {
			for (var gdi = 0; gdi < this.datasets.length; gdi++) {
				if (dataset_name === this.datasets[gdi].dataset_name) {
					return this.datasets[gdi];
				}
			}
		}

		return null;
	}


	//=================================================================================
	bindInputs() {
		Array.from(document.getElementsByTagName('input')).forEach((input) => {
			var bind = input.getAttribute('data-bind');
			if (bind) {
				var value = this.primaryDataset.dataset_content[this.recordPosition][bind];
				if (!value) value = '';

				if (input.type === 'checkbox') {
					input.value = value === "1" ? 'on' : 'off';
					input.checked = value === "1" ? true : false;
				}
				else {
					input.value = value;
				}
			}
		});
	}


	//=================================================================================
	bindPhones() {
		Array.from(document.querySelectorAll("[href*=tel]")).forEach((phone: HTMLBaseElement) => {
			var bind = phone.getAttribute('data-bind');
			if (bind) {
				phone.style.textAlign = localStorage.getItem('direction') === "ltr" ? "left" : "right";
				var value = this.primaryDataset.dataset_content[this.recordPosition][bind];
				if (value) {
					//phone.text = value;
					phone.innerHTML = value;
					phone.href = "tel:" + value;
				}
			}
		});
	}


	//=================================================================================
	bindAddresses() {
		Array.from(document.querySelectorAll("[href*=waze]")).forEach((address: HTMLBaseElement) => {
			var bind = address.getAttribute('data-bind');
			if (bind) {
				//address.style.textAlign = localStorage.getItem('direction') === "ltr" ? "left" : "right";
				var value = this.primaryDataset.dataset_content[this.recordPosition][bind];
				if (value) { // .css("text-align", "center");
					//address.text = value;
					address.innerHTML = value;
					address.href = "waze://?q=" + value;
				}
			}
		});
	}


	//=================================================================================
	setNavigationButtonsBehavior() {
		var prevButton = document.getElementById("eid_nav_prev");
		if (prevButton) (prevButton as HTMLInputElement).disabled = (this.recordPosition === 0);

		var nextButton = document.getElementById("eid_nav_next");
		if (nextButton) (nextButton as HTMLInputElement).disabled = (this.recordPosition >= this.primaryDataset.dataset_content.length - 1);
	}


	//=================================================================================
	public navigatePrev() {
		if (this.recordPosition === 0) return;

		if (!this.onAboutToNavigate()) return;

		this.recordPosition--;
		this.bindData();

		if (this.context &&
			typeof this.context.setMainTableCursor !== 'undefined' &&
			typeof this.context.setMainTableCursor === 'function') {
  			this.context.setMainTableCursor();
		}
	}


	//=================================================================================
	public navigateNext() {
		if (this.recordPosition >= this.primaryDataset.dataset_content.length - 1) return;

		if (!this.onAboutToNavigate()) return;

		this.recordPosition++;
		this.bindData();

		if (this.context &&
			typeof this.context.setMainTableCursor !== 'undefined' &&
			typeof this.context.setMainTableCursor === 'function') {
	  		this.context.setMainTableCursor();
		}
	}


	//=================================================================================
	confirmExit() {
		this.onAboutToNavigate()
	}


	//=================================================================================
	onNewRecordEvent() {
		if (!this.onAboutToNavigate()) return;

		this.createNewPrimaryRow();
		this.recordPosition = this.primaryDataset.dataset_content.length - 1;

		this.bindData();
	}


	//=================================================================================
	onDeleteRecordEvent() {
		if (this.primaryDataset.dataset_content[this.recordPosition].__State !== '1') {// Indicate new row
			const stmt = this.formSqlDeleteStmt();
			if (stmt === "") return;

			this.ufw.WebQuery(stmt);
		}

		this.primaryDataset.dataset_content.splice(this.recordPosition, 1);

		if (this.recordPosition >= this.primaryDataset.dataset_content.length - 1) {
			this.recordPosition = this.primaryDataset.dataset_content.length - 1;
		}

		this.bindData();
	}


	//=================================================================================
	onBackToCallerEvent() {
		if (!this.onAboutToNavigate()) return;

		var view_key_value = this.ufw.ugs.queryParam('parent_key_value');
		var parent_view = this.ufw.ugs.queryParam('parent_view');
		var view_tab = this.ufw.ugs.queryParam('parent_tab');

		var view_position = this.ufw.ugs.queryParam('parent_position');

		this.router.navigate([parent_view], {
			queryParams: {
				view_key_value, view_position, view_tab
			}
		});
	}


	//=================================================================================
	onRecordBeenModified() {
		if (!this.autoUpdate) {
			//this.ufw.ugs.Loger("*** Error: Record been modified with no auto update procedure", true);
			return;
		}

		const stmt = (this.primaryDataset.dataset_content[this.recordPosition]['__State'] === '1') ?
			this.formSqlInsertStmt() : this.formSqlUpdateStmt();
    if (stmt === "") return;
    this.ufw.WebProcedure(stmt, this.primaryDataset.dataset_name);
		this.primaryDataset.dataset_content[this.recordPosition]['__State'] = "0";
	}


	//=================================================================================
	onAboutToNavigate() {
		this.onCheckForChanges();
		return true;
	}


	//=================================================================================
	onCheckForChanges() {
		var inputs = document.querySelectorAll('input,ng-select');

		for (var ocfci = 0; ocfci < inputs.length; ocfci++) {
			var uiElement = inputs[ocfci];
			var fieldName = uiElement.getAttribute('data-bind');

      if (!fieldName) continue;

				var fieldType = this.primaryDataset.dataset_format[0][fieldName];

				var recordValue = this.primaryDataset.dataset_content[this.recordPosition][fieldName];
				if (!recordValue) recordValue = '';

				var uiValue = this.getElementInputValue(uiElement);

				if (this.columnBeenModified(recordValue, uiValue, fieldType)) {
					this.onRecordBeenModified();
					break;
			}
		}
	}


	//=================================================================================
	columnBeenModified(recordValue, uiValue, fieldType) {

		if (fieldType === "String") {
			return (String(recordValue) !== String(uiValue));
		}
		else if (fieldType === "Int") {
			return (parseInt(recordValue) !== parseInt(uiValue));
		}
		else if (fieldType === "Boolean") {
			return (parseInt(recordValue) !== parseInt(uiValue));
		}
		else if (fieldType === "DateTime") {
			return (String(recordValue) !== String(uiValue));
		}
		else if (fieldType === "Time") {
			return (String(recordValue) !== String(uiValue));
		}
		else if (fieldType === "Real") {
			return (parseFloat(recordValue) !== parseFloat(uiValue));
		}

		return false;
	}


	//=================================================================================
	formSqlUpdateStmt() {
		if (!this.checkForUpdateValidity()) return "";

		let modifiedColumns = "";
		for (const fieldName in this.primaryDataset.dataset_format[0]) {
			if (fieldName.startsWith("__")) continue;

			const uiElement = document.getElementById(fieldName);
			if (!uiElement) continue;

			const fieldType = this.primaryDataset.dataset_format[0][fieldName];

			let recordValue = this.primaryDataset.dataset_content[this.recordPosition][fieldName];
			if (!recordValue) recordValue = '';

			const uiValue = this.getElementInputValue(uiElement);

			if (this.columnBeenModified(recordValue, uiValue, fieldType)) {
				this.primaryDataset.dataset_content[this.recordPosition][fieldName] = uiValue;
				modifiedColumns += fieldName + "=" + this.getSqlSyntaxColumnValue(uiValue, fieldType) + ",";
			}
		}

		var whereStmt = this.formSqlWhereStmt();

    return `UPDATE ${this.primaryDataset.dataset_name} `
         + `SET ${this.ufw.ugs.rtrim(",", modifiedColumns)} `
         + `WHERE ${whereStmt}`;
	}


	//=================================================================================
	formSqlInsertStmt() {
		if (!this.checkForInsertValidity()) return "";

		var column_names = "", column_values = "";
		for (var fieldName in this.primaryDataset.dataset_format[0]) {
			if (fieldName.startsWith("__")) continue;

			if (this.isPrimaryKey(fieldName)) continue;

			var fieldType = this.primaryDataset.dataset_format[0][fieldName];
			var uiElement: any = "";
			var uiValue: any = "";

			if (fieldName === this.primaryDataset.foreign_key_field) {
				uiValue = this.primaryDataset.foreign_key_value;
			}
			else {
				uiElement = document.getElementById(fieldName);
				if (uiElement) {
					uiValue = this.getElementInputValue(uiElement);
				}
			}

			this.primaryDataset.dataset_content[this.recordPosition][fieldName] = uiValue;
			column_names += fieldName + ",";
			column_values += this.getSqlSyntaxColumnValue(uiValue, fieldType) + ",";
		}

    return `INSERT INTO ${this.primaryDataset.dataset_name} `
         + `(${this.ufw.ugs.rtrim(",", column_names)}) `
         + `VALUES(${this.ufw.ugs.rtrim(",", column_values)})`;
	}


	//=================================================================================
	formSqlDeleteStmt() {
		if (!this.checkForDeleteValidity()) return "";

		var whereStmt = this.formSqlWhereStmt();

    return `DELETE FROM ${this.primaryDataset.dataset_name} WHERE ${whereStmt}`;
	}


	//=================================================================================
	isPrimaryKey(fieldName) {
		for (let ipki = 1; ; ipki++) {
			const primaryNieldName = this.ufw.ugs.fieldByPosition(this.primaryDataset.primary_key_fields, ipki, "|");
			if (!primaryNieldName) break;

			if (fieldName === primaryNieldName) return true;
		}

		return false;
	}


	//=================================================================================
	formSqlWhereStmt() {
		let whereStmt = "";
		for (let fswsi = 1; ; fswsi++) {
			const primaryNieldName = this.ufw.ugs.fieldByPosition(this.primaryDataset.primary_key_fields, fswsi, "|");
			if (!primaryNieldName) break;

			const primaryFieldType = this.primaryDataset.dataset_format[0][primaryNieldName];
			const primaryFieldValue = this.primaryDataset.dataset_content[this.recordPosition][primaryNieldName];

			whereStmt += primaryNieldName + "=" + this.getSqlSyntaxColumnValue(primaryFieldValue, primaryFieldType) + " AND ";
		}

		if (whereStmt === "") whereStmt = "0=1";
		return this.ufw.ugs.rtrim(" AND ", whereStmt);
	}


	//=================================================================================
	checkForUpdateValidity() {
		if (!this.primaryDataset.dataset_name) {
			this.ufw.ugs.Loger("Error: No table Name", true);
			return false;
		}

		if (!this.primaryDataset.primary_key_fields) {
			this.ufw.ugs.Loger("Error: No primary key", true);
			return false;
		}

		return true;
	}


	//=================================================================================
	checkForInsertValidity() {
		if (!this.primaryDataset.dataset_name) {
			this.ufw.ugs.Loger("Error: No table Name", true);
			return false;
		}

		return true;
	}


	//=================================================================================
	checkForDeleteValidity() {
		if (!this.primaryDataset.dataset_name) {
			this.ufw.ugs.Loger("Error: No table Name", true);
			return false;
		}

		if (!this.primaryDataset.primary_key_fields) {
			this.ufw.ugs.Loger("Error: No primary key", true);
			return false;
		}

		return true;
	}


	//=================================================================================
	getSqlSyntaxColumnValue(rawValue, fieldType) {

		if (fieldType === "String") {
			return this.getSqlStringSyntax(String(rawValue));
		}
		else if (fieldType === "Int") {
			return this.getSqlIntSyntax(String(rawValue));
		}
		else if (fieldType === "Boolean") {
			return this.getSqlBoolSyntax(String(rawValue));
		}
		else if (fieldType === "DateTime") {
			return this.getSqlDatetimeSyntax(String(rawValue));
		}
		//else if (fieldType === "Time") {
		//  return this.getSqlTimeSyntax(String(rawValue));
		//}
		else if (fieldType === "Real") {
			return this.getSqlRealSyntax(String(rawValue));
		}

		return this.getSqlStringSyntax(String(rawValue));   // on default (or unknown field type)
	}


	//=================================================================================
	getSqlStringSyntax(uiValue) {
		const returnValue = uiValue.replace("'", "''").replace("\"", "\"\"").replace("\\", "\\\\");
		return "'" + returnValue + "'";
	}


	//=================================================================================
	getSqlIntSyntax(uiValue) {
		const returnValue = String(parseInt(uiValue ? uiValue : "0"));
		return returnValue;
	}


	//=================================================================================
	getSqlDateSyntax(uiValue) {
		if (!uiValue) return "NULL";

		const momDate = moment(uiValue, ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"])
		const returnValue = momDate.format('YYYY/MM/DD');

		return "'" + returnValue + "'";
	}


	//=================================================================================
	getSqlDatetimeSyntax(uiValue) {
		if (!uiValue) return "NULL";

		const momentDate = moment(uiValue, ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"])
		const returnValue = momentDate.format('YYYY/MM/DD hh:mm:ss');

		return "'" + returnValue + "'";
	}


	//=================================================================================
	getSqlRealSyntax(uiValue) {
		const returnValue = String(parseFloat(uiValue ? uiValue : "0"));
		return returnValue;
	}


	//=================================================================================
	getSqlBoolSyntax(uiValue) {
		const returnValue = String(parseInt(uiValue ? uiValue : "0") !== 0 ? "1" : "0");
		return returnValue;
	}


	//==================================================================================
	matchStart(params, data) {
		params.term = params.term || '';
		if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) === 0) {
			return data;
		}
		return false;
	}


	//=================================================================================
	public setNavigationBar(className) {
		if (!className) return;

		const direction = localStorage.getItem('direction');
		const prevIcon = direction === 'rtl' ? 'right' : 'left';
		const nextIcon = direction === 'rtl' ? 'left' : 'right';

		const plainHTML = "<div style='margin-top: 1.25vh;'>"
			+ "<div class='row form-group col-12'>"
			+ "<div class='col-4'>"
			+ "<div class='input-group'>"
			+ "<span class='input-group-addon'>"
			+ "<i class='nav_back fa fa-arrow-circle-" + prevIcon + "' aria-hidden='true'></i>"
			+ "</span>"
			+ "<input id='eid_nav_prev' type='button' class='btn btn-primary btn-block'"
			+ "style='color: white; font-size: .8rem;  max-height: 30px;'"
      + "value='" + this.locale.uTranslate('Previous') + "'/>"
			+ "</div>"
			+ "</div>"
			+ "<div class='col-4' style='text-align:center'>"
			+ "<input id='eid_nav_position' type='text' class='form-control' dir='ltr'"
			+ "style='font-size: .8rem;  font-weight: 700; max-height: 30px; text-align: center;' readonly>"
			+ "</div>"
			+ "<div class='col-4'>"
			+ "<div class='input-group'>"
			+ "<input id='eid_nav_next' type='button' class='btn btn-primary btn-block'"
			+ "style='color: white; font-size: .8rem;  max-height: 30px;'"
      + "value='" + this.locale.uTranslate('Next') + "'/>"
			+ "<span class='input-group-addon'>"
			+ "<i class='nav_forw fa fa-arrow-circle-" + nextIcon + "' aria-hidden='true'></i>"
			+ "</span>"
			+ "</div>"
			+ "</div>"
			+ "</div>"
			+ "</div>";

		$(className).append(plainHTML);

		$('#eid_nav_prev').on('click', this.navigatePrev.bind(this));
		$('#eid_nav_next').on('click', this.navigateNext.bind(this));
	}


	//=================================================================================
	getDatasetColumnValue(datasetName, rowNumber, columnName) {
		const dataset = this.getDataset(datasetName);
		if (!dataset || (dataset.dataset_content.length <= rowNumber)) return "";

		return dataset.dataset_content[rowNumber][columnName];
	}

  //=================================================================================
	getDatasetRow(datasetName, jsonKey, jsonValue) {
		const rows = this.getDatasetRowsArray(datasetName, jsonKey, jsonValue);
		return (rows.lenght === 0 ? '' : rows[0]);
	}

	//=================================================================================
	getDatasetRowsArray(datasetName, jsonKey, jsonValue) {
		const dataset = this.getDataset(datasetName);
		if (!dataset) return JSON.parse("[]");

		const tableRows = dataset.dataset_content.filter(item => {
			return item[jsonKey] === jsonValue;
		});

		return tableRows;
	}


	//==================================================================================
	checkForLegalIsraelIDCard(id) {
		let tot = 0;
		let tz = new String(id);

		while (tz.length !== 9) tz = "0" + tz;

		for (let i = 0; i < 8; i++) {
			let x = (((i % 2) + 1) * parseInt(tz.charAt(i)));
			if (x > 9) {
				x = x / 10 + x % 10;
			}

			tot += x;
		}

		if ((tot + parseInt(tz.charAt(8))) % 10 === 0) {
			return true;
		} else {
			return false;
		}
	}


	//==================================================================================
	checkForLegalEmail(email) {
		return ((email.length > 5) && (email.indexOf('@') > 0));
	}


	//==================================================================================
	checkForRequired(elmID) {
		const uiElement = document.getElementById(elmID) as HTMLInputElement;
		const uiValue = this.getElementInputValue(uiElement);
		//var uiPrompt = uiElement.getAttribute("placeholder");
		const uiPrompt = this.getElementInputLabel(uiElement);
    if (!uiValue) {
      this.ufw.ugs.Loger(`Error: ${this.locale.msg_no_value}: ${uiPrompt}`, true);
			return false;
		}

		return true;
	}


	//==================================================================================
	checkForValidity(elmID, validityCheck) {
		const uiElement = document.getElementById(elmID);
		const uiValue = this.getElementInputValue(uiElement);
		//var uiPrompt = uiElement.getAttribute("placeholder");
		const uiPrompt = this.getElementInputLabel(uiElement);

		if (!uiValue) return true;

		if (!validityCheck(uiValue)) {
      this.ufw.ugs.Loger(`Error: ${this.locale.msg_illegal_value}: ${uiPrompt}`, true);
			return false;
		}

		return true;
	}


	//==================================================================================
	checkForLegalPhoneNumber(eidAC, eidPN) {
		const elmAreaCode = document.getElementById(eidAC);
		const elmPhoneNumber = document.getElementById(eidPN);

		const areaCode = this.getElementInputValue(elmAreaCode);
		const phoneNumber = this.getElementInputValue(elmPhoneNumber);

		//var acPrompt = elmAreaCode.getAttribute("placeholder");
		const acPrompt = this.getElementInputLabel(elmAreaCode);

		//var pnPrompt = elmPhoneNumber.getAttribute("placeholder");
		const pnPrompt = this.getElementInputLabel(elmPhoneNumber);

		if (phoneNumber) {
			if (phoneNumber.length !== 7) {
        this.ufw.ugs.Loger(`Error: ${this.locale.msg_illegal_value}: ${pnPrompt}`, true);
				return false;
			}
		}

		if (areaCode && !phoneNumber) {
      this.ufw.ugs.Loger(`Error: ${this.locale.msg_no_value}: ${pnPrompt}`, true);
			return false;
		}

		if (!areaCode && phoneNumber) {
      this.ufw.ugs.Loger(`Error: ${this.locale.msg_no_value}: ${acPrompt}`, true);
			return false;
		}

		return true;
	}


	//==================================================================================
	getElementInputValue(uiElement) {
		let uiValue = (uiElement as HTMLInputElement).value;

		if (uiElement.tagName.toLowerCase() === 'ng-select') {
			uiValue = this.context.getSelectedValue(uiElement.id);
		}
		if ((uiElement as HTMLInputElement).type === 'checkbox') {
			uiValue = ((uiElement as HTMLInputElement).checked) ? "1" : "0";
		}

		return uiValue;
	}


	//==================================================================================
	getElementInputLabel(uiElement) {
		let uiLabel = uiElement.getAttribute("placeholder");

		if (uiElement.tagName.toLowerCase() === 'ng-select') {
			uiLabel = this.context.getSelectedLabel(uiElement);
		}

		return uiLabel;
	}
}
