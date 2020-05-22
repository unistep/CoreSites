

//=================================================================================
	var g_view_key_value		= "";
	var g_record_position		= 0;
	var g_view_tab				= 0;

	var g_parent_key_value		= "";
	var g_parent_view			= "";
	var g_parent_position		= "";
	var g_parent_tab			= "";

	var	g_primary_dataset		= null;

	var	g_on_binding			= false;
	var	g_auto_update			= false;


//=================================================================================
$(document).ready(function () {
	window.onbeforeunload = confirmExit;

	g_view_key_value		= queryParam("view_key_value");
	g_record_position		= parseInt(queryParam("view_position"));
	g_view_tab				= parseInt(queryParam("view_tab"));

	g_parent_key_value		= queryParam("parent_key_value")
	g_parent_view			= queryParam("parent_view");
	g_parent_position		= queryParam("parent_position");
	g_parent_tab			= queryParam("parent_tab");

	if (!g_record_position	|| (g_record_position < 0))	g_record_position	= 0;
	if (!g_view_tab			|| (g_view_tab < 0))		g_view_tab			= 0;

	selectTab(".nav-tabs", g_view_tab);

	prepareDatasets();

	$('.date').datepicker({
		language: g_datepicker_language,
		showTodayButton: true,
		orientation: g_view_direction == "RTL" ? "right" : "left",
		autoclose: true,
		disableTouchKeyboard: true,
		Readonly: "true",
		//container: '#From_Coordinated_Time',
		daysOfWeekDisabled: [5, 6]
	});

	$('.nav-link').on('click', genericActions);
});


//=================================================================================
function prepareDatasets() {
	if (!g_datasets) return;

	for (i = 0; i < g_datasets.length; i++)
	{
		g_datasets[i].dataset_format = JSON.parse(g_datasets[i].dataset_format);
		g_datasets[i].dataset_content = JSON.parse(g_datasets[i].dataset_content);
	}

	g_primary_dataset = g_datasets[0];

	if (g_primary_dataset.dataset_content.length == 0) {
		createNewPrimaryRow();
	}

	if (g_record_position > g_primary_dataset.dataset_content.length - 1)
		g_record_position = g_primary_dataset.dataset_content.length - 1;
}


//=================================================================================
function createNewPrimaryRow() {
	var newRow = {};

	 for (var key in g_primary_dataset.dataset_format[0]) {
		newRow[key] = '';
    }

	newRow['__State'] = '1';
	g_primary_dataset.dataset_content.push(newRow);
}


//=================================================================================
function genericActions(event) {
	if (this.pathname) {
		if (this.pathname.endsWith("New")) {
			$(".navbar-collapse").collapse('hide');
			event.preventDefault();
			onNewRecordEvent();
			return false;
		}
		if (this.pathname.endsWith("Delete")) {
			$(".navbar-collapse").collapse('hide');
			event.preventDefault();
			onDeleteRecordEvent();
			return false;
		}
		if (this.pathname.endsWith("Exit")) {
			$(".navbar-collapse").collapse('hide');
			event.preventDefault();
			onBackToCallerEvent();
			return false;
		}
	}

	return true;
}


//=================================================================================
function bindData() {
	element_navpos = document.getElementById('eid_nav_position');
	if (element_navpos) {
		navpos = sprintf("%d / %d", g_record_position + 1, g_primary_dataset.dataset_content.length)
		element_navpos.value = navpos
	}

	g_on_binding = true;

	if (typeof beforeBinding !== 'undefined' && typeof beforeBinding === 'function') {
		beforeBinding();
	}

	bindInputs();
	bindPhones();
	bindAddresses();
	bindTables();
	bindSelects();

	if (typeof afterBinding !== 'undefined' && typeof afterBinding === 'function') {
		afterBinding();
	}

	g_on_binding = false;

	setNavigationButtonsBehavior();
}


//=================================================================================
function bindSelects() {
	Array.from(document.getElementsByTagName('select')).forEach(function (select) {
		dataset_name = select.getAttribute('data-dataset');
		if (dataset_name) {
			loadSelect2Element(select, dataset_name, false);

			bind = select.getAttribute('data-bind');
			if (bind) {
				value = g_primary_dataset.dataset_content[g_record_position][bind];
				if (!value) value = '';

				select.value = value;
			}
		}
		else {
			select.value = '';
		}
	})
}


//=================================================================================
function bindTables() {
	Array.from(document.getElementsByTagName('table')).forEach(function (table) {
		dataset_name = table.getAttribute('data-bind');
		if (dataset_name) {
			dataset = getDataset(dataset_name);
			if (dataset) {
				while (table.tBodies.length > 0) {
					table.removeChild(table.tBodies[0])
				}

				tblBody = document.createElement("tbody");
				table.appendChild(tblBody);

				if (dataset.foreign_key_field) {
					template = sprintf("//*[%s=\"%s\"]", dataset.foreign_key_field,
						g_primary_dataset.dataset_content[g_record_position][dataset.parent_key_field]);

					tableRows = JSON.search(dataset.dataset_content, template);
				}
				else {
					tableRows = dataset.dataset_content;
				}

				tableRows.forEach(function (tableRow) {
					var row = createTableRow(table, tableRow);
					tblBody.appendChild(row);
				});
			}
		}
	})
}


//=================================================================================
function createTableRow(table, json_table_row) { // ??
	var _row = document.createElement("tr");

	Array.from(table.getElementsByTagName('th')).forEach(function (header) {
		var _cell = document.createElement('td');
		var _label = document.createElement("Label");

		bind = header.getAttribute('data-bind');
		if (bind && json_table_row[bind]) {
			_label.innerHTML = json_table_row[bind];
		}

		_cell.appendChild(_label);
		_row.appendChild(_cell);
	});

	return _row;
}


//=================================================================================
function getDataset(dataset_name) {
	if (g_datasets) {
		for (gdi = 0; gdi < g_datasets.length; gdi++) {
			if (dataset_name === g_datasets[gdi].dataset_name) {
				return g_datasets[gdi];
			}
		}
	}

	return null;
}


//=================================================================================
function bindInputs() {
	Array.from(document.getElementsByTagName('input')).forEach(function (input) {
		bind = input.getAttribute('data-bind');
		if (bind) {
			value = g_primary_dataset.dataset_content[g_record_position][bind];
			if (!value) value = '';

			if (input.type == 'checkbox') {
				input.value = (value == "1") ? 'on' : 'off';
				input.checked = (value == "1") ? true : false;
			}
			else {
				input.value = value;
			}
		}
	});
}


//=================================================================================
function bindPhones() {
	Array.from(document.querySelectorAll("[href*=tel]")).forEach(function (phone) {
		bind = phone.getAttribute('data-bind');
		if (bind) {
			phone.style.textAlign = ((g_view_direction == "LTR") ? "left" : "right");
			value = g_primary_dataset.dataset_content[g_record_position][bind];
			if (value) {
				phone.text = value;
				phone.innerHTML = value;
				phone.href = "tel:" + value;
			}
		}
	});
}


//=================================================================================
function bindAddresses() {
	Array.from(document.querySelectorAll("[href*=waze]")).forEach(function (address) {
		bind = address.getAttribute('data-bind');
		if (bind) {
			address.style.textAlign = ((g_view_direction == "LTR") ? "left" : "right");
			value = g_primary_dataset.dataset_content[g_record_position][bind];
			if (value) { // .css("text-align", "center");
				address.text = value;
				address.innerHTML = value;
				address.href = "waze://?q=" + value;
			}
		}
	});
}


//==================================================================================
function loadSelect2Element(elm_id, dataset_name, add_empty_row) {
	dataset = getDataset(dataset_name);
	if (!dataset) return;

	initializeSelect2Element(elm_id, dataset.dataset_content, add_empty_row);
}


//=================================================================================
function setNavigationButtonsBehavior() {
	prevButton = document.getElementById("eid_nav_prev");
	if (prevButton) prevButton.disabled = (g_record_position == 0);

	nextButton = document.getElementById("eid_nav_next");
	if (nextButton) nextButton.disabled = (g_record_position >= g_primary_dataset.dataset_content.length - 1);
}


//=================================================================================
function navigatePrev() {
	if (g_record_position == 0) return;

	if (!onAboutToNavigate()) return;

	g_record_position--;
	bindData();
}


//=================================================================================
function navigateNext() {
	if (g_record_position >= g_primary_dataset.dataset_content.length - 1) return;

	if (!onAboutToNavigate()) return;

	g_record_position++;
	bindData();
}


//=================================================================================
function confirmExit() {
	onAboutToNavigate()
}


//=================================================================================
function onNewRecordEvent() {
	if (!onAboutToNavigate()) return;

	createNewPrimaryRow();
	g_record_position = g_primary_dataset.dataset_content.length - 1;

	bindData();
}


//=================================================================================
function onDeleteRecordEvent() {
	if (g_primary_dataset.dataset_content[g_record_position].__State != '1') {// Indicate new row
		stmt = formSqlDeleteStmt();
		if (stmt === "") return;

		commProcedure(null, g_primary_dataset.dataset_name, stmt);
	}

	g_primary_dataset.dataset_content.splice(g_record_position, 1);

	if (g_record_position >= g_primary_dataset.dataset_content.length - 1) {
		g_record_position  = g_primary_dataset.dataset_content.length - 1;
	}

	bindData();
}


//=================================================================================
function onBackToCallerEvent() {
	if (!onAboutToNavigate()) return;

	var redirect = g_application_url + "/" + g_parent_view	+
		"?view_key_value="	+ g_parent_key_value.toString()		+
		"&view_position="	+ g_parent_position.toString()	+
		"&current_tab="		+ g_parent_tab.toString();

	window.location.href = redirect;
}


//=================================================================================
function onRecordBeenModified() {
	if (!g_auto_update) {
		Loger("*** Error: Record been modified with no auto update procedure", true);
		return;
	}

	stmt = (g_primary_dataset.dataset_content[g_record_position]['__State'] == '1') ? formSqlInsertStmt() : formSqlUpdateStmt();
	if (stmt === "") return;
	commProcedure(null, g_primary_dataset.dataset_name, stmt);
	g_primary_dataset.dataset_content[g_record_position]['__State'] = "0";
}


//=================================================================================
function onAboutToNavigate() {
	onCheckForChanges();
	return true;
}


//=================================================================================
function onCheckForChanges() {
	inputs = document.querySelectorAll('input,select');

	for (ocfci = 0; ocfci < inputs.length; ocfci++) {
		ui_element = inputs[ocfci];
		field_name = ui_element.getAttribute('data-bind');

		if (field_name) {
			field_type = g_primary_dataset.dataset_format[0][field_name];

			record_value = g_primary_dataset.dataset_content[g_record_position][field_name];
			if (!record_value) record_value = '';

			ui_value = ui_element.value;

			if (ui_element.type == 'checkbox') {
				ui_value = (ui_element.checked) ? "1" : "0";
				record_value = record_value == "" ? "0" : record_value;
			}

			if (columnBeenModified(record_value, ui_value, field_type)) {
				onRecordBeenModified();
				break;
			}
		}
	}
}


//=================================================================================
function columnBeenModified(record_value, ui_value, field_type) {

	if (field_type == "String") {
		return (String(record_value) != String(ui_value));
	}
	else if (field_type == "Int") {
		return (parseInt(record_value) != parseInt(ui_value));
	}
	else if (field_type == "Boolean") {
		return (parseInt(record_value) != parseInt(ui_value));
	}
	else if (field_type == "DateTime") {
		return (String(record_value) != String(ui_value));
	}
	else if (field_type == "Time") {
		return (String(record_value) != String(ui_value));
	}
	else if (field_type == "Real") {
		return (parseFloat(record_value) != parseFloat(ui_value));
	}

	return false;
}


//=================================================================================
function formSqlUpdateStmt() {
	if (!checkForUpdateValidity()) return "";

	modifiedColumns = "";
	for (field_name in g_primary_dataset.dataset_format[0]) {
		if (field_name.startsWith("__")) continue;

		ui_element = document.getElementById(field_name);
		if (!ui_element) continue;

		field_type = g_primary_dataset.dataset_format[0][field_name];

		record_value = g_primary_dataset.dataset_content[g_record_position][field_name];
		if (!record_value) record_value = '';

		ui_value = ui_element.value;

		if (ui_element.type == 'checkbox') {
			ui_value = (ui_element.checked) ? "1" : "0";
		}

		if (columnBeenModified(record_value, ui_value, field_type)) {
			g_primary_dataset.dataset_content[g_record_position][field_name] = ui_value;
			modifiedColumns += field_name + "=" + getSqlSyntaxColumnValue(ui_value, field_type) + ",";
		}
	}

	where_stmt = formSqlWhereStmt();

	return sprintf("UPDATE %s SET %s WHERE %s", g_primary_dataset.dataset_name, rtrim(",", modifiedColumns), where_stmt);
}


//=================================================================================
function formSqlInsertStmt() {
	if (!checkForInsertValidity()) return "";

	column_names = "", column_values = "";
	for (field_name in g_primary_dataset.dataset_format[0]) {
		if (field_name.startsWith("__")) continue;

		if (isPrimaryKey(field_name)) continue;

		field_type = g_primary_dataset.dataset_format[0][field_name];

		if (field_name == g_primary_dataset.foreign_key_field) {
			ui_value    = g_primary_dataset.foreign_key_value;
		}
		else {
			ui_element = document.getElementById(field_name);
			ui_value = ui_element ? (ui_element.type == 'checkbox') ? (ui_element.checked) ? "1" : "0" : ui_element.value : "";
		}

		g_primary_dataset.dataset_content[g_record_position][field_name] = ui_value;
		column_names += field_name + ",";
		column_values += getSqlSyntaxColumnValue(ui_value, field_type) + ",";
	}

	return sprintf("INSERT INTO %s (%s) VALUES (%s)", g_primary_dataset.dataset_name, rtrim(",", column_names), rtrim(",", column_values));
}


//=================================================================================
function formSqlDeleteStmt() {
	if (!checkForDeleteValidity()) return "";

	where_stmt = formSqlWhereStmt();

	return sprintf("DELETE FROM %s WHERE %s", g_primary_dataset.dataset_name, where_stmt);
}


function isPrimaryKey(field_name) {
	for (ipki = 1; ; ipki++) {
		primary_field_name = fieldByPosition(g_primary_dataset.primary_key_fields, ipki, "|");
		if (!primary_field_name) break;

		if (field_name === primary_field_name) return true;
	}

	return false;
}


//=================================================================================
function formSqlWhereStmt() {
	where_stmt = "";
	for (fswsi = 1; ; fswsi++) {
		primary_field_name = fieldByPosition(g_primary_dataset.primary_key_fields, fswsi, "|");
		if (!primary_field_name) break;

		primary_field_type  = g_primary_dataset.dataset_format[0][primary_field_name];
		primary_field_value = g_primary_dataset.dataset_content[g_record_position][primary_field_name];

		where_stmt += primary_field_name + "=" + getSqlSyntaxColumnValue(primary_field_value, primary_field_type) + " AND ";
	}

	if (where_stmt == "") where_stmt = "0=1";
	return rtrim(" AND ", where_stmt);
}


//=================================================================================
function checkForUpdateValidity() {
	if (!g_primary_dataset.dataset_name) {
		doModal(g_msg_error, "No table Name");
		return false;
	}

	if (!g_primary_dataset.primary_key_fields) {
		doModal(g_msg_error, "No primary key");
		return false;
	}

	return true;
}


//=================================================================================
function checkForInsertValidity() {
	if (!g_primary_dataset.dataset_name) {
		doModal(g_msg_error, "No table Name");
		return false;
	}

	return true;
}


//=================================================================================
function checkForDeleteValidity() {
	if (!g_primary_dataset.dataset_name) {
		doModal(g_msg_error, "No table Name");
		return false;
	}

	if (!g_primary_dataset.primary_key_fields) {
		doModal(g_msg_error, "No primary key");
		return false;
	}

	return true;
}


//=================================================================================
function getSqlSyntaxColumnValue(raw_value, field_type) {

	if (field_type == "String") {
		return getSqlStringSyntax(String(raw_value));
	}
	else if (field_type == "Int") {
		return getSqlIntSyntax(String(raw_value));
	}
	else if (field_type == "Boolean") {
		return getSqlBoolSyntax(String(raw_value));
	}
	else if (field_type == "DateTime") {
		return getSqlDatetimeSyntax(String(raw_value));
	}
	else if (field_type == "Time") {
		return get_sql_time_syntax(String(raw_value));
	}
	else if (field_type == "Real") {
		return getSqlRealSyntax(String(raw_value));
	}

	return getSqlStringSyntax(String(raw_value));   // on default (or unknown field type)
}


//=================================================================================
function getSqlStringSyntax(ui_value) {
	return_value = ui_value.replace("'", "''").replace("\"", "\"\"").replace("\\", "\\\\");
	return "'" + return_value + "'";
}


//=================================================================================
function getSqlIntSyntax(ui_value) {
	return_value = String(parseInt(ui_value ? ui_value : "0"));
	return return_value;
}


//=================================================================================
function getSqlDateSyntax(ui_value) {
	if (!ui_value) return "NULL";

	momDate = moment(ui_value, ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"])
	return_value = momDate.format('YYYY/MM/DD');

	return "'" + return_value + "'";
}


//=================================================================================
function getSqlDatetimeSyntax(ui_value) {
	if (!ui_value) return "NULL";

	moment_date = moment(ui_value, ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"])
	return_value = moment_date.format('YYYY/MM/DD hh:mm:ss');

	return "'" + return_value + "'";
}


//=================================================================================
function getSqlRealSyntax(ui_value) {
	return_value = String(parseFloat(ui_value ? ui_value : "0"));
	return return_value;
}


//=================================================================================
function getSqlBoolSyntax(ui_value) {
	return_value = String(parseInt(ui_value ? ui_value : "0") != 0 ? "1" : "0");
	return return_value;
}


//==================================================================================
function initializeSelect2Element(elm_id, json_data, add_empty_row) {
	elm_select2 = $(elm_id);
	elm_select2.empty();

	elm_select2[0].style.width = '100%';

	if (add_empty_row || !json_data) {
		elm_select2.append("<option></option>");
	}

	if (!((json_data == null) || (json_data == ""))) {
		elm_select2.select2({ data: json_data });
	}

	elm_select2.select2({
		matcher: function (params, data) {
			return matchStart(params, data);
		},

		placeholder: elm_select2.attr('placeholder'),
		minimumResultsForSearch: 60
	});
}


//==================================================================================
function matchStart(params, data) {
	params.term = params.term || '';
	if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) == 0) {
		return data;
	}
	return false;
}


//=================================================================================
function setSelectPlaceholder(elm_id, strPlaceholder) {
	elm_select2 = $(elm_id);

	elm_select2.select2({
		matcher: function (params, data) {
			return matchStart(params, data);
		},

		placeholder: strPlaceholder,
		minimumResultsForSearch: 60
	});
}


//=================================================================================
function initializeSelect2ExpiredYearCombo(elm_id) {
	var yearOptions = JSON.parse("[]");
	var currentDate = new Date();
	var currentYear = currentDate.getFullYear();

	for (var i = 0; i < 10; i++) {
		var yearRow = {};
		yearRow['id']	= (currentYear + i - 2000).toString()
		yearRow['text']	= (currentYear + i).toString();
		yearOptions.push(yearRow);
	}

	initializeSelect2Element(elm_id, yearOptions, true);
}


//=================================================================================
function initializeSelect2MonthCombo(elm_id) {
	var monthOptions = JSON.parse("[]");

	for (var i = 1; i <= 12; i++) {
		var monthRow = {};
		monthRow['id'] = monthRow['text'] = ((i < 10) ? "0" + i.toString() : i.toString());
		monthOptions.push(monthRow);
	}

	initializeSelect2Element(elm_id, monthOptions, true);
}
