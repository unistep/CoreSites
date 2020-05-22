
//=================================================================================
$(document).ready(function ()
{
	$('.cameraFrame').click(takeAPhoto);
    $('.cameraFrame input').change(onPhotoChange);

	$('#eid_cart_table').on('click', 'tr', doShoppingCart);

	initializeSelect2ExpiredYearCombo('#eid_expiration_year');
	initializeSelect2MonthCombo('#eid_expiration_month');

	bindData();

	drawMap(true) // true = get and draw current position 
});


//=================================================================================
function afterBinding() {
	setTotalPayment();
}


//=================================================================================
function doShoppingCart (event) {
	var redirect = g_application_url + "/" + g_current_controller + "/ServiceCall_ShoppingCart"	+
		"?view_key_value="		+ g_primary_dataset.dataset_content[g_record_position]['Work_Order_PKey'] +
		"&view_position="		+ (event.currentTarget.rowIndex - 1).toString() +

		"&parent_key_valye="	+ g_view_key_value +
		"&parent_view="			+ g_current_controller + "/" + g_current_view +
		"&parent_position="		+ g_record_position.toString() +
		"&parent_tab=4";

	window.location.href = redirect;
}


//=================================================================================
function onButtonRowClicked(inputElement) {
	if (!inputElement) return;

	if (!inputElement.value)
		inputElement.value = moment().format('YYYY/MM/DD HH:mm');
	else
		inputElement.value = '';

	if (inputElement.id != "On_My_Way_Time") return;

	if (inputElement.value) {
		if (!g_current_location) {
			onDurationDone("~0:30");
			return;
		}

		origin = g_current_location;  // DO NOT REMOVE
		destination = g_primary_dataset.dataset_content[g_record_position].Destination_Latlng;
		duration = getGoogleDuration(origin, destination, onDurationDone);
	}
	else {
		recipient = "0544719547";
		//recipient = g_primary_dataset.dataset_content[g_record_position].Contact_Phone_1;
		message = sprintf(g_msg_arrival_cancelled, g_primary_dataset.dataset_content[g_record_position].Vehicle_ID);
		commSms(null, recipient, message);
	}
}


//=================================================================================
function onDurationDone(duration) {
	recipient = "0544719547";
	//recipient = g_primary_dataset.dataset_content[g_record_position].Contact_Phone_1;
	message = sprintf(g_msg_on_my_way, g_primary_dataset.dataset_content[g_record_position].Vehicle_ID, duration);
	commSms(null, recipient, message);
}


//=================================================================================
function onLocationChange() {
    var geocoder = new google.maps.Geocoder;

    geocoder.geocode({ 'location': g_current_location }, function (results, status) {
        if ((status === 'OK') && results[0]) {
            setSelectPlaceholder('#eid_city', results[0].address_components[2].short_name);
            setSelectPlaceholder('#eid_street', results[0].address_components[1].short_name);
            //document.getElementById('eid_building_no').value = results[0].address_components[0].short_name;
        }
        else {
            Loger("*** Geocoder failed due to: " + status);
        }
    });
}


//=================================================================================
function takeAPhoto() {
    if (window.event.srcElement.localName == "input") return;
    if (window.event.srcElement.className == "cameraPhoto") return;

    var callerInput = this.getElementsByTagName('input')[0];
    if (callerInput == null) return;

    callerInput.click();
}


//=================================================================================
function onPhotoChange() {
    var callerCam = this.parentElement;
    var callerImage = callerCam.getElementsByTagName('div')[0];
    var callerFa = callerCam.getElementsByTagName('i')[0];

    callerFa.style.display = 'none';
    callerImage.style.display = 'block';

    var file = this.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onloadend = function () {
        callerImage.style.background = 'url("' + reader.result + '")';
        callerImage.style.backgroundSize = "cover";
    }

	reader.readAsDataURL(file);
	remoteFileName = this.getAttribute('data-file');

	ext = getExtension(this.files[0].name);
	if (ext) remoteFileName += ("." + ext);
	remoteFilePath = g_primary_dataset.dataset_content[g_record_position]['Files_Folder'] + '/' + remoteFileName;

	ajaxUpload(null, this, remoteFilePath);
}


//=================================================================================
function doCreditPayment(response) {
	confNo = $("#eid_confirmation_number").val();
	if (confNo) return;

	$("#eid_confirmation_number").val(confNo = "");

	if (response == null) {
		if (!validateCreditTransactionElements()) return;

		var cardNo		= $('#eid_card_number').val();
		var firstName	= $('#eid_card_first_name').val();
		var lastName	= $('#eid_card_last_name').val();
		var cardExp		= $('#eid_expiration_month').val()
						+ $('#eid_expiration_year').val();
		var cvv			= $('#eid_cvv_code').val();
		var holderID	= $('#eid_id_number').val();

		var billAmount	= document.getElementById("eid_total_payment").innerHTML;
		var billAmount	= "1";
		var payments	= "1";

		var cardInfo = sprintf("%s, %s, %s, %s, %s, %s, %s, %s, %s", holderID, // DOC
			cardNo, cardExp, billAmount, payments, cvv, holderID, firstName, lastName);

		//commCreditAction(do_payment, "AuthorizeCredit", strCardInfo); // AuthorizeCredit
		commCreditAction(doCreditPayment, "CreditPayment", cardInfo); // CreditPayment
	}
	else {
		var message		= g_ccard_no_confirmation;
		var messageExt	= g_msg_error + ": " + g_msg_no_response;

		if (response != "") {
			var actionType	= fieldByPosition(response, 1, ",");
			var confirmed	= fieldByPosition(response, 2, ",");
			var arg3		= fieldByPosition(response, 3, ",");
			var expDate		= fieldByPosition(arg3,  4, "/");

			message			= g_ccard_no_confirmation;
			messageExt		= g_msg_error + ": " + arg3;

			//if (actionType.toUpperCase() === "AUTHORIZECREDIT")
			if (actionType.toUpperCase() === "CREDITPAYMENT")
			{
				if (confirmed.toUpperCase() === "OK") {
					message		= g_ccard_successfully_confirmed;
					messageExt	= g_msg_completed + ": " + arg3;

					$("#eid_confirmation_number").val(fieldByPosition(arg3, 1, "/"));

					disableCreditTransactionElements();
					return;
				}
			}
		}

		doModal(message, messageExt);
	}
}


//=================================================================================
function validateCreditTransactionElements() {
	if (!checkForRequired('eid_card_number')) return false;
	if (!checkForRequired('eid_card_first_name')) return false;
	if (!checkForRequired('eid_card_last_name')) return false;
	if (!checkForRequired('eid_expiration_month')) return false;
	if (!checkForRequired('eid_expiration_year')) return false;
	if (!checkForRequired('eid_cvv_code')) return false;
	if (!checkForValidity('eid_id_number', checkForLegalIsraelIDCard)) return false;

	if (!document.getElementById("eid_total_payment").innerHTML) {
		doModal(g_msg_error, sprintf(g_msg_no_value, g_total_payment));
		return false;
	}

	return true;
}


//=================================================================================
function disableCreditTransactionElements() {
	document.getElementById("eid_btn_payment").style.backgroundColor = "lightgray";
	document.getElementById("eid_btn_payment").disabled = true;

	document.getElementById('eid_card_number').disabled = true;
	document.getElementById('eid_card_first_name').disabled = true;
	document.getElementById('eid_card_last_name').disabled = true;
	document.getElementById('eid_expiration_month').disabled = true;
	document.getElementById('eid_expiration_year').disabled = true;
	document.getElementById('eid_cvv_code').disabled = true;
	document.getElementById('eid_id_number').disabled = true;
}


//=================================================================================
function setTotalPayment() {
	dataset = getDataset("VU_Cart_Detail_Line_Extended");
	if (!dataset) return;

	template = sprintf("//*[%s=\"%s\"]", dataset.foreign_key_field,
		g_primary_dataset.dataset_content[g_record_position][dataset.parent_key_field]);

	tableRows = JSON.search(dataset.dataset_content, template);

	total_payment = 0;
	for (var i = 0; i < tableRows.length; i++) {
		total_payment += parseFloat(tableRows[i].Cart_Row_Total_Price);
	}

	document.getElementById("eid_total_payment").innerHTML = total_payment.toString();
}
