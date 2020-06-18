
import { Component } from 'react'
import ugsX from './u-generics.service';
import * as $ from 'jquery';

export class UfwInterface extends Component {

    ugs = null;

    //===================================================
    constructor() {
        super();
        //this.state = {};

        this.ugs = ugsX;
    }

    //===================================================
    getAppParams(callBack) {
        this.callPost(callBack, 'GetAppParams');
    }

    //===================================================
    SPA_ChangeLanguage(language) {
        this.callPost(null, 'SPA_ChangeLanguage', `language=${language}`);
    }

    //===================================================
    setLanguage(language = null) {
        var _language = language ? language : this.ugs.getLocalStorageItem('Language');
        if (!_language) language = 'English';

        const self = this;
        const service = `assets/i18n/${this.ugs.languageCodes.getCodeByName(_language)}.json`;
        this.callGet(setLanguageResponse, service);

        function setLanguageResponse(response) {
            self.ugs.adjustUserLanguage(_language, response);
            if (language) self.SPA_ChangeLanguage(_language);
        }
	}

    //===================================================
    TimeClock(callBack, params) {
        this.callPost(callBack, 'TimeClock', params);
    }

    //===================================================
    SendSMS(recipient, message) {
        this.callPost(null, 'SendSMS', "", JSON.stringify({ recipient, message }));
    }

    //===================================================
    CreditAction(callBack, transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
        payments, cvv, holderID, firstName, lastName) {

        this.callPost(callBack, 'CreditAction', "", JSON.stringify({
            transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
            payments, cvv, holderID, firstName, lastName
        }));
    }

    //===================================================
    WebQuery(stmt) {
        this.callPost(null, 'WebQuery', "", stmt);
    }

    //===================================================
    WebProcedure(tableName, stmt) {
        this.callPost(null, 'WebProcedure', "", JSON.stringify({ tableName, stmt }));
    }

    //===================================================
    ServiceCall(callBack, callerID) {
        if (callerID) callerID = `view_key_value=${callerID}`;
        this.callGet(callBack, 'ServiceCall', callerID);
	}

    //===================================================
    ShoppingCart(callBack, view_key_value) {
        view_key_value = `view_key_value=${view_key_value}`;
        this.callGet(callBack, 'ShoppingCart', view_key_value);
    }

    //===================================================
    callGet(callback, service, params) {
        this.callHttp("GET", callback, service, params);
    }

    //===================================================
    callPost(callback, service, params, body) {
        this.callHttp("POST", callback, service, params, body);
    }

    //===================================================
    callHttp(callType, callback, service, params, body) {
        const self = this;
        this.ugs.setSpinner(true);

        const TO = 10000; // getEndpointTO("");
        let url = `${this.ugs.getEndpointUrl("")}${service}`;
        if (params) url += '?' + params;

        $.ajax({
            url: url,
            type: callType,
            timeout: TO,
            data: body,
            dataType: "text",
            cache: false,

            success: function (response) {
                self.ugs.setSpinner(false);

                response = JSON.parse(response);
                if (typeof response.errorMessage !== 'undefined') {
                    self.ugs.Loger(response.errorMessage, true);
                    return;
                }

                if (callback) callback(response);
            },

            error: function (err) {
                self.ugs.setSpinner(false);

                const errorText = err.responseText ? err.responseText : err.statusText;
                self.ugs.Loger("*** " + service + " error: " + errorText, true);
                return;
            }
        });
    }
}

const ufwX = new UfwInterface();
export default ufwX;
