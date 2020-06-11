
import { Component } from 'react'
import { UGenericsService } from './u-generics.service';
import { UGmapsService } from './u-gmaps.service';
import { UDbService } from './u-db.service';
import { BaseFormComponent } from '../templates/BaseFormComponent';
import * as $ from 'jquery';

export class UfwInterface extends Component {
    ugs = null;
    udb = null;
    gmap = null;
    bfc = null;

    constructor() {
        super();
        this.state = {};
        this.ugs = new UGenericsService(this);
        this.udb = new UDbService(this);
        this.gmap = new UGmapsService(this.ugs);
        this.bfc = new BaseFormComponent(this.ugs, this.udb, this.gmap, this);
    }

    getAppParams(callBack) {
        this.callPost(callBack, 'GetAppParams');
    }

    SPA_ChangeLanguage(language) {
        this.callPost(null, 'SPA_ChangeLanguage', `language=${language}`);
    }

    TimeClock(params) {
        this.callPost(null, 'TimeClock', params);
    }

    SendSMS(recipient, message) {
        this.callPost(null, 'SendSMS', "", JSON.stringify({ recipient, message }));
    }

    CreditAction(callBack, transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
        payments, cvv, holderID, firstName, lastName) {

        this.callPost(callBack, 'CreditAction', "", JSON.stringify({
            transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
            payments, cvv, holderID, firstName, lastName
        }));
    }

    WebQuery(stmt) {
        this.callPost(null, 'WebQuery', "", stmt);
    }

    ServiceCall(callBack, callerID) {
        if (callerID) callerID = `view_key_value=${callerID}`;
        this.callGet(callBack, 'ServiceCall', callerID);
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
        self.ugs.setSpinner(true);

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
