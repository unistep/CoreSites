
////=================================================================================
//	var g_web_service_url		= "";


////===================================================
//$(document).ready(function () {
//	g_web_service_url = sprintf("ws://%s:59000/Message?", "212.143.252.251"); // "212.143.252.254")';
//})

////===================================================
//function commQuery(callback, table, stmt)
//{
//	if (g_comm_method == "WebSocket")	webSocketQuery(callback, table, stmt);
//	else								ajaxCall(callback, "WebQuery", table, stmt)
//}


////===================================================
//function commProcedure(callback, table, stmt)
//{
//	if (g_comm_method == "WebSocket")	WebSocketProcedure(callback, table, stmt);
//	else								ajaxCall(callback, "WebProcedure", table, stmt)
//}


////===================================================
//function commCreditAction(callback, trans_type, card_data)
//{
//	if (g_comm_method == "WebSocket")	webSocketCreditAction(callback, trans_type, card_data);
//	else								ajaxCall(callback, "CreditAction", trans_type, card_data)
//}


////===================================================
//function commSms(callback, recipient, message) {
//	//if (g_comm_method == "SendSMS") webSocketSms(callback, recipient, message);
//	ajaxCall(callback, "SendSMS", recipient, message)
//}


////===================================================
//function webSocketQuery(callback, table, stmt)
//{
//	var message_header = sprintf("WebQuery, %s, %s", "Web_16976", "");

//	var message = sprintf("%s, %s, STMT: %s", message_header, table, stmt);

//	webSocketCall(callback, message);
//}


////===================================================
//function webSocketProcedure(callback, table, stmt)
//{
//	message_header = sprintf("WebProcedure, %s, %s", "Web_16976", "");

//	var message = sprintf("%s, %s, STMT: %s", message_header, table, stmt);

//	webSocketCall(callback, message);
//}


////===================================================
//function webSocketCreditAction(callback, trans_type, card_data)
//{
//	var message = sprintf("%s, %s, %s, %s", trans_type, "Web_16976", "", card_data);

//	webSocketCall(callback, message);
//}


////===================================================
//function webSocketCall(callback, message)
//{
//	var callback_done	= false;

//	document.getElementById("eid_loader").style.display = "block";
//	document.body.style.cursor = "wait";

//	var socket = new WebSocket(g_web_service_url + message);
//	socket.onopen = function ()
//	{
//	}

//	socket.onmessage = function (msg)
//	{
//		doCallBack(msg.data);
//		socket.close();
//	}

//	socket.onclose = function (event)
//	{
//		document.getElementById("eid_loader").style.display = "none";
//		document.body.style.cursor = "default";
//	}

//	socket.onerror = function (err)
//	{
//		request_type = fieldByPosition(message, 1, ",");
//		Loger("*** " + request_type + " Socket error: " + err, false);

//		//doCallBack("");
//		socket.close();
//	}

//	doCallBack = function (response)
//	{
//		if (callback_done) return;

//		callback_done = true;

//		if (response == null) response = ""

//		if (callback) callback(response);

//		if (response == "")
//		{
//			var request_type = fieldByPosition(message, 1, ",");
//			Loger("*** " + request_type + " Socket error: No response", false);
//		}
//	}
//}


////===================================================
//function ajaxCall(callback, request_type, param1, param2)
//{
//	document.getElementById("eid_loader").style.display = "block";
//	document.body.style.cursor = "wait";

//	var token = $('input[name="__RequestVerificationToken"]').val();
//	var target_url = g_application_url + "/" + g_current_controller + '/Ajax';

//	$.ajax({
//		url: target_url,
//		type: 'POST',
//		data:
//		{
//			__RequestVerificationToken: token,
//			ajax_request: request_type,
//			param1: param1,
//			param2: param2
//		},
//		//dataType: 'json',
//		cache: false,
//		success: function (response)
//		{
//			document.getElementById("eid_loader").style.display = "none";
//			document.body.style.cursor = "default";

//			if (callback) callback(response);
//		},
//		error: function (err)
//		{
//			document.getElementById("eid_loader").style.display = "none";
//			document.body.style.cursor = "default";

//			Loger("*** " + request_type + " error: " + err, false);
//			if (callback) callback("");
//		}
//	});
//}


////===================================================
//function ajaxUpload(callback, file_input, remote_file_path) {
//	if (file_input == null) return;

//	document.getElementById("eid_loader").style.display = "block";
//	document.body.style.cursor = "wait";

//	var token = $('input[name="__RequestVerificationToken"]').val();
//	var target_url = g_application_url + "/" + g_current_controller + '/AjaxUpload';

//	var form_data = new FormData();
//	form_data.append("__RequestVerificationToken", token)

//	form_data.append(remote_file_path, file_input.files[0]);

//	$.ajax({
//		type: 'POST',
//		url: target_url,
//		data: form_data,
//		contentType: false,
//		processData: false,
//		success: function (data) {
//			document.getElementById("eid_loader").style.display = "none";
//			document.body.style.cursor = "default";
//			data = data.replaceAll("\"", "");

//			if (data.indexOf("Uploaded") === 0) {
//				Loger("Your file was successfully uploaded");
//			} else {
//				Loger("*** There was an error uploading your file");
//			}
//		},
//		error: function (data) {
//			document.getElementById("eid_loader").style.display = "none";
//			document.body.style.cursor = "default";
//			Loger("*** There was an error uploading your file");
//		}
//	});
//}
