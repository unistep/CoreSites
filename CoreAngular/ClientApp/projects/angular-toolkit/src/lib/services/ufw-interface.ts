
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

import { UGenericsService } from './u-generics.service';

@Injectable({
  providedIn: 'root'
})

export class UfwInterface {

  constructor(private http: HttpClient,
     public ugs: UGenericsService) {
      this.getAppParams();
  }

  public async getAppParams() {
    let language = localStorage.getItem('Language');
    if (!language) language = "";
     
    const response = await this.post(`GetAppParams?language=${language}`);
    this.ugs.setAppParams(response);
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

    let url = `${this.ugs.getEndpointUrl("")}${this.controllerName()}${service}`;
    if (params) url += '?' + params

    const TO: any = this.ugs.getEndpointTO("");
    const promise = this.http.post(url, body, httpOptions).pipe(timeout(TO)).toPromise();
    return promise.then((response: any) => {
      response = JSON.parse(response);

      if ((typeof response.errorMessage !== 'undefined') &&
        (response.errorMessage != null)) {
        this.ugs.Loger(response.errorMessage, true);
        return null;
      }

      return response;
    }).catch(error => {
      this.ugs.Loger(`${error.message}: ${url}`, true);
      return null;
    });
  }

  //=================================================================================
  public get(service: string, params: any = ""): Promise<any> {
    const httpOptions: any = { responseType: 'text' };

    let url = `${this.ugs.getEndpointUrl("")}${this.controllerName()}${service}`;
    if (params) url += '?' + params

    const TO: any = this.ugs.getEndpointTO("");
    const promise = this.http.get(url, httpOptions).pipe(timeout(TO)).toPromise();
    return promise.then((response: any) => {
      response = JSON.parse(response);

      if ((typeof response.errorMessage !== 'undefined') &&
        (response.errorMessage != null)) {
        this.ugs.Loger(response.errorMessage, true);
        return null;
      }

      return response;
    }).catch(error => {
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
  public webRequest(caller, callback, requestType, param1?, param2?) {
    const url = this.ugs.getEndpointUrl("");

    const httpOptions: any = {
      responseType: 'text',
      observe: 'response'
    };

    const query = url + "WebApi?"
        + "request_type=" + requestType
        + "&param1=" + param1
        + "&param2=" + param2;

    this.http.post(query, "", httpOptions)
      .subscribe(
        response => {
              this.ugs.Loger(`<${requestType}> POST Request is successful.`);

              if (callback) callback.bind(caller)((response as any).body);
        },
        error => {
            this.ugs.Loger(`*** <${requestType}> error: ${error}`, false);

          if (callback) callback.bind(caller)("");
        })
  }
}
