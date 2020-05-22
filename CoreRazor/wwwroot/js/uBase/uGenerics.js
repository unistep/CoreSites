
//=================================================================================
	var g_application_url		= "";
	var	g_current_controller	= "";
	var	g_current_view			= "";
	var g_splitter_slided		= null;


//=================================================================================
$(document).ready(function () {
	if (!String.prototype.endsWith) {  // IE
		String.prototype.endsWith = function (searchString, position) {
			var subjectString = this.toString();
			if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
				position = subjectString.length;
			}
			position -= searchString.length;
			var lastIndex = subjectString.lastIndexOf(searchString, position);
			return lastIndex !== -1 && lastIndex === position;
		};
	}

	$(document).click(function () {
		Loger();
	});

	if (!window.location.origin) { // IE
		window.location.origin = window.location.protocol + "//"
			+ window.location.hostname
			+ (window.location.port ? ':'
			+ window.location.port : '');
	}

	url = window.location.pathname.split("/").filter(Boolean);

	if (window.location.origin.includes("localhost:")) {
		g_application_url = window.location.origin;
		g_current_controller = url[0];
		g_current_view = url[1];
	}
	else {
		g_application_url = window.location.origin + "/" + url[0];
		g_current_controller = url[1];
		g_current_view = url[2];
	}

	$('.splitter').mousedown(function () {
		bodyContent = document.getElementsByClassName('body-content');
		if (bodyContent && bodyContent.length != 0) {
			bodyContent[0].addEventListener("mousemove", onResizePanel);
			g_splitter_slided = this;
		}
		return false;
	});

	$(document).mouseup(function () {
		bodyContent = document.getElementsByClassName('body-content');
		if (bodyContent && bodyContent.length != 0) {
			bodyContent[0].removeEventListener("mousemove", onResizePanel);
			g_splitter_slided = null;
		}
		return false;
	});

	window.onresize = function () { resizeWindow() };
	resizeWindow();
});


//=================================================================================
function onResizePanel(event) {
	if (!g_splitter_slided) return;
	element = $(g_splitter_slided.parentElement).children('.left').first();
	if (!element) return;

	let viewWidth = window.innerWidth;
	let panelwidth = $(element).width();

	let panelPosition = $(element).position().left;
	let pagePosition = event.pageX;

	if (g_view_direction === "RTL") {
		panelPosition = viewWidth - (panelwidth + panelPosition);
		pagePosition = viewWidth - event.pageX;
	}

	$(element).width(pagePosition - (panelPosition - $(g_splitter_slided).width() / 2));
}


//=================================================================================
function resizeWindow() {
	//Loger(sprintf("browser: %s, system: %s", bowser.name, bowser.osname), true);

	if (bowser.osname == 'Windows') {
		$('.map-canvas').css({
			'min-height': '70%'
		});

		return;
	}

	if (bowser.osname == 'iOS') {

		if (bowser.name == "Safari") {
			$('body').css({
				'height': '89vh'
			});

			$('.body-content').css({
				'height': '77vh'
			});

			$('.nframe').css({
				'height': '69vh'
			});

			$('.tframe').css({
				'height': '60vh'
			});

			$('.map-canvas').css({
				'min-height': '68%'
			});
		}
		else if (bowser.name == "Chrome") {
			$('.body-content').css({
				'height': '86.5vh'
			});

			$('.nframe').css({
				'height': '78vh'
			});

			$('.tframe').css({
				'height': '68vh'
			});

			$('.map-canvas').css({
				'min-height': '70%'
			});
		}
	}
	else if (bowser.osname == 'Android') {
		if (bowser.name == "Safari") {
			$('body').css({
				'height': '90vh'
			});

			$('.body-content').css({
				'height': '77vh'
			});

			$('.nframe').css({
				'height': '69vh'
			});

			$('.tframe').css({
				'height': '59vh'
			});
		}
		else {
			if (bowser.name == "Chrome") {
				$('body').css({
					'height': '90vh'
				});

				$('.body-content').css({
					'height': '77vh'
				});

				$('.nframe').css({
					'height': '69vh'
				});

				$('.tframe').css({
					'height': '59vh'
				});
			}
		}
	}
}


//=================================================================================
function queryParam(param_name)
{
	var query = window.location.search.substring(1);
	var params = query.split("&");

	for (i = 0; i < params.length; i++)
	{
		param_value = params[i].split("=");

		if (param_value[0] == param_name)
		{
			return param_value[1];
		}
	}

	return "";
}


//=================================================================================
function fieldByPosition(script, offset, stops)
{
	if (script == "" || script == null || offset == 0) return "";

	args = script.split (stops);

	if (args.length == 0 || args.length < offset) return "";

	return args[offset - 1].trim();
}


//===================================================
String.prototype.replaceAll = function (search, replace)
{
	if (!replace)
	{
		return this.toString();
	}

	return this.replace(new RegExp('[' + search + ']', 'g'), replace);
}


//===================================================
function Loger(message, do_alert)
{
	_status_line = document.getElementById('#eid_status');
	_site_line = document.getElementById('#eid_site');

	if (_status_line) _status_line.style.display	=  message ? 'block' : 'none';
	if (_site_line)   _site_line.style.display		= !message ? 'block' : 'none';

	if (!message)  return;

	window.console.log(message);

	if (_status_line) _status_line.style.color = ((message.indexOf("*** ") === 0) ? 'red' : 'black');

	message = message.replace("*** ", "");

	if (_status_line) _status_line.innerHTML = message;

	if (do_alert) window.alert(message);
}


//==================================================================================
function ltrim(char, str) {
	if (str.slice(0, char.length) === char) {
		return ltrim(char, str.slice(char.length));
	} else {
		return str;
	}
}


//==================================================================================
function rtrim(char, str) {
	if (str.slice(str.length - char.length) === char) {
		return rtrim(char, str.slice(0, 0 - char.length));
	} else {
		return str;
	}
}


//==================================================================================
function checkForLegalIsraelIDCard(il_id) {
	tot = 0;
	tz = new String(il_id);

	while (tz.length != 9) tz = "0" + tz;

	for (i = 0; i < 8; i++) {
		x = (((i % 2) + 1) * tz.charAt(i));
		if (x > 9) {
			x = x.toString();
			x = parseInt(x.charAt(0)) + parseInt(x.charAt(1))
		}
		tot += x;
	}

	if ((tot + parseInt(tz.charAt(8))) % 10 == 0) {
		return true;
	} else {
		return false;
	}
}


//==================================================================================
function checkForLegalEmail(str_email)
{
	return ((str_email.length > 5) && (str_email.indexOf('@') > 0));
}


//==================================================================================
function checkForRequired(elm_id)
{
	elment	= document.getElementById(elm_id);
	value	= elment.value;
	prompt	= elment.getAttribute("placeholder");

	if (!value)
	{
		doModal(g_msg_error, sprintf(g_msg_no_value, prompt));
		return false;
	}

	return true;
}


//==================================================================================
function checkForValidity(elm_id, validity_check)
{
	elment = document.getElementById(elm_id);
	value = elment.value;
	prompt = elment.getAttribute("placeholder");

	if (!value) return true;

	if (!validity_check(value))
	{
		doModal(g_msg_error, sprintf(g_msg_illegal_value, prompt));
		return false;
	}

	return true;
}


//==================================================================================
function checkForLegalPhoneNumber(eid_ac, eid_pn)
{
	elm_area_code	= document.getElementById(eid_ac);
	elm_phone_number= document.getElementById(eid_pn);

	area_code		= elm_area_code.value;
	phone_number	= elm_phone_number.value;

	ac_prompt		= elm_area_code.getAttribute("placeholder");
	pn_prompt		= elm_phone_number.getAttribute("placeholder");

	if (phone_number) {
		if (phone_number.length != 7) {
			doModal(g_msg_error, sprintf(g_msg_illegal_value, pn_prompt));
			return false;
		}
	}

	if (area_code && !phone_number) {
		doModal(g_msg_error, sprintf(g_msg_no_value, pn_prompt));
		return false;
	}

	if (!area_code && phone_number) {
		doModal(g_msg_error, sprintf(g_msg_no_value, ac_prompt));
		return false;
	}

	return true;
}


//==================================================================================
function getImage(img_path)
{
	img = new Image();
	img.src = g_application_url + img_path;
	return 'url(' + img.src + ')';
}


//==================================================================================
function changeLanguage()
{
	form = document.getElementById('set_language');
	form.submit();

	document.getElementById('eid_change_language_submit').style.display = 'none'
	document.getElementById('eid_pb_frame').style.display = 'block';

	var pb_bar = document.getElementById('eid_pb_bar')

	var i = 1

	timeout();

	function timeout()
	{
		setTimeout(function () {
			pb_bar.style.width = i++ % 100 + '%';
			timeout();
		}, 1000);
	}
}


//==================================================================================
function getExtension(path) {
	var basename = path.split(/[\\/]/).pop(),  // extract file name from full path ...
		// (supports `\\` and `/` separators)
		pos = basename.lastIndexOf(".");       // get last position of `.`

	if (basename === "" || pos < 1)            // if file name is empty or ...
		return "";                             //  `.` not found (-1) or comes first (0)

	return basename.slice(pos + 1);            // extract extension ignoring `.`
}


//==================================================================================
function doModal(heading, formContent) {
	html = '<div id="dynamicModal" class="modal fade" tabindex="-1" role="dialog" '
		 + 'aria-labelledby="confirm-modal" aria-hidden="true" '
		 + 'dir="' + g_view_direction + '"> ';
	html += '<div class="modal-dialog">';
	html += '<div class="modal-content">';
	html += '<div class="modal-header">';
	html += '<a class="close" data-dismiss="modal">ª</a>';
	html += '<h4>' + heading + '</h4>'
	html += '</div>';
	html += '<div class="modal-body" style="font-size:1.5em">';
	html += formContent;
	html += '</div>';
	html += '<div class="modal-footer">';
	html += '<span class="btn btn-primary" data-dismiss="modal">' + g_msg_close + '</span>';
	html += '</div>';  // content
	html += '</div>';  // dialog
	html += '</div>';  // footer
	html += '</div>';  // modalWindow
	$('body').append(html);
	$("#dynamicModal").modal();
	$("#dynamicModal").modal('show');

	$('#dynamicModal').on('hidden.bs.modal', function (e) {
		$(this).remove();
	});
}


//=================================================================================
function selectTab(class_name, tab_index) { 	//tabindex start at 0 
	$(class_name + ' li').removeClass('active');
	$(class_name + ' li').eq(tab_index).addClass('active');
	$(class_name + ' li:eq(' + tab_index + ') a').tab('show')
}


//=================================================================================
//function FindActiveDiv() {
//	var DivName = $('.nav-tabs .active a').attr('href');
//	return DivName;
//}
//function RemoveFocusNonActive() {
//	$('.nav-tabs  a').not('.active').blur();
//	//to >  remove  :hover :focus;
//}
//function ShowInitialTabContent() {
//	RemoveFocusNonActive();
//	var DivName = FindActiveDiv();
//	if (DivName) {
//		$(DivName).addClass('active');
//	}
//}


//=================================================================================
//function Navigator() {

//	var routeAPI = (g_nav_method === "Waze") ? "https://waze.com/ul?q=%s" :
//		"https://www.google.com/maps/dir/?api=1&destination=%s&dir_action=navigate";  // "waze://?q=%s"
//	var route = sprintf(routeAPI, this.innerHTML);
//	window.open(route);
//}
