
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

import { UGenericsService } from './u-generics.service';

import * as $ from 'jquery';
declare var $: any;

@Injectable({
  providedIn: 'root'
})

export class UfwInterface {

  public Version = "";

  constructor(private http: HttpClient, @Inject('BASE_URL') public baseUrl,
    public ugs: UGenericsService) {

    const _parseURL = new URL(baseUrl);
    if (_parseURL.port == '4200') this.baseUrl = "https://localhost:444/";
    this.ugs.locale.baseUrl = this.baseUrl;

    this.getAppParams();
  }

  public async getAppParams() {
    let language = localStorage.getItem('Language');
    if (!language) language = "";
     
    const parameters = await this.post(`GetAppParams?language=${language}`);

    localStorage.setItem('AssemblyVersion', parameters.AssemblyVersion);
    localStorage.setItem('KnownLanguages', parameters.KnownLanguages);
    localStorage.setItem('Language', parameters.Language);
    localStorage.setItem('Endpoints', parameters.Endpoints);

    this.Version = localStorage.getItem('AssemblyVersion');

    this.ugs.locale.setLanguageParams();
  }
  

  public TimeClock(params): Promise<any> {
    return this.post('TimeClock', params);
  }

  public SendSMS(recipient, message): Promise<any> {
    return this.post('SendSMS', "", { recipient, message });
  }

  public CreditAction(transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
        payments, cvv, holderID, firstName, lastName): Promise<any> {
    return this.post('CreditAction', "", {
        transType, transID, cardNumber, expiredYear, expiredMonth, billAmount,
        payments, cvv, holderID, firstName, lastName });
  }


  public WebQuery(stmt) {
    return this.post('WebQuery', "", stmt);
  }
  

  public WebProcedure(stmt, tableName) {
    return this.post('WebProcedure', "", { stmt, tableName });
  }


  public post(service: string, params: any = "", body?): Promise<any> {
    const httpOptions: any = { responseType: 'text' };

    let url = `${this.getEndpointUrl("")}${this.controllerName()}${service}`;
    if (params) url += '?' + params

    this.setSpinner(true);
    const TO: any = this.getEndpointTO("");
    const promise = this.http.post(url, body, httpOptions).pipe(timeout(TO)).toPromise();
    return promise.then((response: any) => {
      response = JSON.parse(response);
      this.setSpinner(false);

      if ((typeof response.errorMessage !== 'undefined') &&
        (response.errorMessage != null)) {
        this.ugs.Loger(response.errorMessage, true);
        return null;
      }

      return response;
    }).catch(error => {
      this.setSpinner(false);
      this.ugs.Loger(`${error.message}: ${url}`, true);
      return null;
    });
  }

  //=================================================================================
  public get(service: string, params: any = ""): Promise<any> {
    const httpOptions: any = { responseType: 'text' };

    let url = `${this.getEndpointUrl("")}${this.controllerName()}${service}`;
    if (params) url += '?' + params

    this.setSpinner(true);
    const TO: any = this.getEndpointTO("");
    const promise = this.http.get(url, httpOptions).pipe(timeout(TO)).toPromise();
    return promise.then((response: any) => {
      response = JSON.parse(response);
      this.setSpinner(false);

      if ((typeof response.errorMessage !== 'undefined') &&
        (response.errorMessage != null)) {
        this.ugs.Loger(response.errorMessage, true);
        return null;
      }

      return response;
    }).catch(error => {
      this.setSpinner(false);
      this.ugs.Loger(`${error.message}: ${url}`, true);
      return null;
    });
  }


  //=================================================================================
  uploadFile(file, remoteFilePath): Promise<any> {
    const ext = file.name.split('.').pop();
    if (ext) remoteFilePath += ("." + ext);

    const fileToUpload = file as File;
    const formData = new FormData();
    formData.append(remoteFilePath, fileToUpload, fileToUpload.name);

    return this.post('Upload', '', formData);
  }

  controllerName(): string {
    return '';
  }


  //=================================================================================
  getEndpointUrl(endpointName) {
    if (!endpointName) return this.baseUrl;
    let endpoints = localStorage.getItem('Endpoints');
    if (!endpoints) return this.baseUrl;

    let endpointsJSON = JSON.parse(endpoints);
    for (let i = 0; i < endpointsJSON.length; i++) {
      if (endpointsJSON[i].EndpointName !== endpointName) continue;
      return endpointsJSON[i].EndpointUrl;
    }

    return this.baseUrl
  }


  //=================================================================================
  getEndpointTO(endpointName) {
    if (!endpointName) return 30 * 1000;
    let endpoints = localStorage.getItem('Endpoints');
    if (!endpoints) return this.baseUrl;

    let endpointsJSON = JSON.parse(endpoints);
    for (let i = 0; i < endpointsJSON.length; i++) {
      if (endpointsJSON[i].EndpointName !== endpointName) continue;
      return Number(endpointsJSON[i].Timeout) * 1000;
    }

    return 30 * 1000;
  }


  //=================================================================================
  public setSpinner(boolSet) {// on=true, off=false

    document.body.style.cursor = boolSet ? "wait" : "default";

    $('#eid_spinner').remove();
    if (!boolSet) return;

    var _spinner = "<div id='eid_spinner' class='spinner'>"
      + "<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i>"
      + "<span class='sr-only'>Loading...</span>"
      + "</div>";

    $('body').append(_spinner);
  }
}
