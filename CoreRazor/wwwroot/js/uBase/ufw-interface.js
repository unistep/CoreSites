
function getAppParams(callBack) {
    callPost(callBack, 'GetAppParams');
}

function TimeClock(params) {
    callPost(null, 'TimeClock', params);
}

function SendSMS(recipient, message) {
    callPost(null, 'SendSMS', "", JSON.stringify({ recipient, message }));
}

function CreditAction(callBack, transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
    payments, cvv, holderID, firstName, lastName) {

    callPost(callBack, 'CreditAction', "", JSON.stringify({
        transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
        payments, cvv, holderID, firstName, lastName
    }));
}

function WebQuery(stmt) {
    callPost(null, 'WebQuery', "", stmt);
}

//function ServiceCall(callBack, callerID) {
//    if (callerID) callerID = `view_key_value=${callerID}`;
//    callGet(callBack, 'ServiceCall', callerID);
//}


//===================================================
function callGet(callback, service, params) {
    callHttp("GET", callback, service, params);
}

//===================================================
function callPost(callback, service, params, body) {
    callHttp("POST", callback, service, params, body);
}

//===================================================
function callHttp(callType, callback, service, params, body) {
    document.getElementById("eid_loader").style.display = "block";
    document.body.style.cursor = "wait";

    const TO = 10000; // getEndpointTO("");
    //const token = $('input[name="__RequestVerificationToken"]').val();
    let url = `${g_application_url}/${service}`;
    if (params) url += '?' + params

    $.ajax({
        url: url,
        type: callType,
        timeout: TO,
        data: body,
        dataType: "text",
        cache: false,

        success: function (response) {
            document.getElementById("eid_loader").style.display = "none";
            document.body.style.cursor = "default";
            response = JSON.parse(response);
            if (typeof response.errorMessage !== 'undefined') {
                Loger(response.errorMessage, true);
                return;
            }

            if (callback) callback(response);
        },

        error: function (err) {
            document.getElementById("eid_loader").style.display = "none";
            document.body.style.cursor = "default";

            const errorText = err.responseText ? err.responseText : err.statusText;
            Loger("*** " + service + " error: " + errorText, true);
            return;
        }
    });
}
