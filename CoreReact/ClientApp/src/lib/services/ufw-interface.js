
import { Component } from 'react'
import { UGenericsService } from './u-generics.service';
import { UGmapsService } from './u-gmaps.service';
import { UDbService } from './u-db.service';
import { BaseFormComponent } from '../templates/BaseFormComponent';
import { post } from 'axios';


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

    async getAppParams() {

        const result = await this.post('GetAppParams');
        this.ugs.setAppParams(result);
               //lang = await this.languageCodes.LoadLAng("assets/i18n/" + this.current_language + '.json');
        //if (lang) setCurrLang(lang);

    }

    TimeClock(params) {
        return this.post('TimeClock', params);
    }
    //
    SendSMS(recipient, message) {
        return this.post('SendSMS', "", { recipient, message });
    }

    CreditAction(transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
        payments, cvv, holderID, firstName, lastName) {
        return this.post('CreditAction', "", {
            transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
            payments, cvv, holderID, firstName, lastName
        });
    }

    timeout(milliseconds, promise) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("timeout exceeded"))
            }, milliseconds)
            promise.then(resolve, reject)
        })
    }

    async post(service, params = "", bodydata = {}) {
        var b = await JSON.stringify(bodydata);
         const httpOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/text' },
             body: b
        };
        //if (body) {
        //    httpOptions.body = await JSON.stringify(body);
        //}
        let url = `${this.ugs.getEndpointUrl("")}${this.controllerName()}${service}`;
        if (params) url += '?' + params;
        const response = await fetch(url, httpOptions);
        const json = await response.json();
        //self.setState({ data: json });
        return json;

    }
    //
    async  get(service, params = "") {
        const httpOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/text' }
        };

 //       var self = this;

        let url = `${this.ugs.getEndpointUrl("")}${this.controllerName()}${service}`;
        if (params) url += '?' + params;
        const response = await fetch(url, httpOptions);
        const json = await response.json();
        //self.setState({ data: json });
        return json;

    }



    //=================================================================================
    async uploadFile(file, remoteFilePath) {
        const ext = file.name.split('.').pop();
        if (ext) remoteFilePath += ("." + ext);
        const fileToUpload = file;
        const formData = new FormData();
        formData.append(remoteFilePath, fileToUpload, fileToUpload.name);
        let url = this.ugs.getEndpointUrl("") + "Upload";
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        return post(url, formData, config);



        return await this.post('Upload', '', formData);
    }

    controllerName() {
        return '';
    }


    //=================================================================================
    webRequest(caller, callback, requestType, param1, param2) {
        const url = this.ugs.getEndpointUrl("");

        //const httpOptions = {
        //    responseType: 'text',
        //    observe: 'response'
        //};
        const httpOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/text' },
            body: JSON.stringify({ title: 'React Hooks POST Request Example' })
        };
        const query = url + "WebApi?"
            + "request_type=" + requestType
            + "&param1=" + param1
            + "&param2=" + param2;
        httpOptions.body = "";

        fetch(query, httpOptions)
            .then(async response => {
                const data = await response.json();

                // check for error response
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }

                //this.setState({ postId: data.id })
            })
            .catch(error => {
               // this.setState({ errorMessage: error });
                console.error('There was an error!', error);
            });
    }
}
const ufwX = new UfwInterface();
export default ufwX;
export const httpOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/text' },
    body: ""
};
