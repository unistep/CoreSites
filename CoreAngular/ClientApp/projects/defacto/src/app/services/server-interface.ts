
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { timeout } from 'rxjs/operators';

import { UGenericsService } from '../../../../angular-toolkit/src/public-api';

@Injectable({
  providedIn: 'root'
})

export class ServerInterface {

  constructor (private http: HttpClient,
               private ugs: UGenericsService) {
  }

  public doLogin(User, Password): Promise<any> {
    return this.Post('SystemLogin.aspx', { User, Password });
  }

  public fetchVendor(): Promise<any> {
    var SessionKey = this.getToken();
    return this.Post('CRMFetchVendors.aspx', {SessionKey});
  }

  public fetchCustomerList(): Promise<any> {
    var SessionKey = this.getToken();
    return this.Post('CRMFetchCustomers.aspx', { SessionKey });
  }

  public CreatePDFReport(params: string): Promise<any> {
    var paramsObject = JSON.parse(params);
    paramsObject.SessionKey = this.getToken();
    params = JSON.stringify(paramsObject);
    return this.Post('CRMCreatePDFReport.aspx', params);
  }

  public fetchCategories(): Promise<any> {
    var SessionKey = this.getToken();
    return this.Post('CRMFetchFilters.aspx', { SessionKey });
  }

  public fetchTransactions(params: string): Promise<any> {
    var paramsObject = JSON.parse(params);
    paramsObject.SessionKey = this.getToken();
    params = JSON.stringify(paramsObject);
    return this.Post('CRMFetchTickets.aspx', params);
  }

  public fetchCustomer(params: string): Promise<any> {
    var paramsObject = JSON.parse(params);
    paramsObject.SessionKey = this.getToken();
    params = JSON.stringify(paramsObject);
    return this.Post('CRMRecognizeMember.aspx', params);
  }

  public fetchTicketTypes(TicketType: string): Promise<any> {
    var SessionKey = this.getToken();
    return this.Post('CRMFetchTicketTypes.aspx', { TicketType, SessionKey });
  }

  public TicketRegistration(Ticket: any): Promise<any> {
    var SessionKey = this.getToken();
    var params = { Ticket, SessionKey };
    return this.Post('CRMTicketRegistration.aspx', JSON.stringify(params));
  }

  public TicketUpdate(Ticket: any): Promise<any> {
    var SessionKey = this.getToken();
    var params = { Ticket, SessionKey };
    return this.Post('CRMTicketUpdate.aspx', JSON.stringify(params));
  }

  public MemberRegistration(params: any, SysId): Promise<any> {
    params.SessionKey = this.getToken();
    var query = SysId ? 'CRMMemberUpdate.aspx' : 'CRMMemberRegistration.aspx';
    return this.Post(query, JSON.stringify(params));
  }

  public fetchTicket(TicketSysId: any): Promise<any> {
    var SessionKey = this.getToken();
    var params = { TicketSysId, SessionKey };
    return this.Post('CRMTicketGet.aspx', JSON.stringify(params));
  }


  public TicketSendSMS(params: any): Promise<any> {
    params.SessionKey = this.getToken();
    return this.Post('CRMTicketSendSMS.aspx', JSON.stringify(params));
  }

  public TicketAddConversation(params: any): Promise<any> {
    params.SessionKey = this.getToken();
    return this.Post('CRMTicketAddConversation.aspx', JSON.stringify(params));
  }

  public TicketPrint(params: any): Promise<any> {
    params.SessionKey = this.getToken();
    return this.Post('CRMTicketPrint.aspx', JSON.stringify(params));
  }

  public TicketHistory(params: any): Promise<any> {
    params.SessionKey = this.getToken();
    return this.Post('CRMTicketFetchActions.aspx', JSON.stringify(params));
  }


  public Post(service: string, params: any = ''): Promise<any> {
    var url = this.ugs.getEndpointUrl("DeFacto4443") + this.controllerName() + service;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    
    let TO: any = this.ugs.getEndpointTO("DeFacto4443");
    const promise = this.http.post(url, params, { headers }).pipe(timeout(TO)).toPromise();
    return promise.then((result: any) => {
      if (result.ErrorCode === 0) return result;

      if (result.ErrorMessage) {
        this.ugs.Loger(result.ErrorMessage, true);
      }
      else {
        this.ugs.Loger(`${this.ugs.uTranslate("Service_Unknown_Error")} ${ result.ErrorCode}`, true);
      }
      return null;
    }).catch(error => {
      this.ugs.Loger(`${error.message}: ${url}`, true);
      return null;
    });
  }

  //=================================================================================
	uploadFile(caller, callback, files, trsKey, remoteFilePath?, existingUri?) {

    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      const fileToUpload = files[i] as File;

      formData.append(fileToUpload.name, fileToUpload, fileToUpload.name);
    }

    const baseUrl = this.ugs.getEndpointUrl("DeFacto4443") + "/";

    const httpOptions: any = {
      responseType: 'text',
      observe: 'response'
    };

    const query = baseUrl + "CRMTicketUploadFile.aspx" +
      "?trsKey=" + trsKey +
      "&TicketSysId=" + remoteFilePath +
      "&ExistingUri=" + existingUri;

    this.http.post(query, formData, httpOptions)
      .subscribe(
        () => {
          this.ugs.Loger("Upload POST Request is successful.");
          if (callback) callback.bind(caller)();
          //this.setSpinner(false);
        },
        error => {
          this.ugs.Loger(`*** <upload> error: ${error}`);
          if (callback) callback.bind(caller)();
          //this.setSpinner(false);
        })
	}

  controllerName(): string {
    return '';
  }


  public isAuthValid(): boolean {
    return localStorage.getItem("SessionKey") ? true : false;
  }

  public saveSession(login: any) {
    localStorage.setItem("SessionKey", login.SessionKey);
    localStorage.setItem("UserName", login.UserProfile.UserName);
    localStorage.setItem("UserAccountSysId", login.UserProfile.UserAccountSysId);
    localStorage.setItem("SysContext", login.UserProfile.SysContext);
    localStorage.setItem("IsAllowViewReports", login.UserProfile.IsAllowViewReports);
  }

  public getToken(): string {
    return localStorage.getItem("SessionKey");
  }

  public getUserName(): string {
    return localStorage.getItem("UserName");
  }

  public getUserAccountSysId(): string {
    return localStorage.getItem("UserAccountSysId");
  }

  public getSysContext(): string {
    return localStorage.getItem("SysContext");
  }

  public IsAllowViewReports(): string {
    return localStorage.getItem("IsAllowViewReports");
  }

  public clearSession() {
    localStorage.setItem("SessionKey", '');
    localStorage.setItem("UserName", '');
    localStorage.setItem("UserAccountSysId", '');
    localStorage.setItem("SysContext", '');
  }
}
