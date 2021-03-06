
import { Injectable } from '@angular/core';
import { ULocalization } from './u-localizaion.service';

@Injectable()

export class UGenericsService {

  //===================================================
  constructor(public locale: ULocalization) {
  }


  //===================================================
  Loger(message, do_alert?) {
    var status_line = document.getElementById('eid_status_line');
    while (status_line && status_line.firstChild) {
      status_line.removeChild(status_line.firstChild);
    }

    if (!message) {
      var _site_address: any =
        `<div id='eid_site_address' dir='ltr'>`
        + `<a href='${this.locale.uTranslate("Developer_Site")}' `
        + `target='_blank'>Site by: &nbsp; ${this.locale.uTranslate("Developer_Name")}</a></div>`;
      if (status_line) status_line.innerHTML = _site_address;
      return;
    }

    if (status_line) {
      var _status_message: any = ("<div id='eid_status_message' dir='ltr'></div>");
      status_line.innerHTML = _status_message;
      var status_message = document.getElementById('eid_status_message');
      status_message.style.color = (message.indexOf("*** ") === 0) ? 'red' : 'black';
      message = message.replace("*** ", "");
      status_message.innerHTML = message.replace("<", "&lt").replace(">", "&gt");
    }

    window.console.log(message);
    if (do_alert) window.alert(message);
  }


  //=================================================================================
  public getLocalStorageItem(itemName) {
    var item = localStorage.getItem(itemName);
    if (!item || item === "undefined") item = "";
    return item;
  }


  //=================================================================================
  queryItem(itemName) {
    var query = window.location.search.substring(1);
    var params = query.split("&");

    for (var i = 0; i < params.length; i++) {
      var param_value = params[i].split("=");

      if (param_value[0] === itemName) {
        return decodeURI(param_value[1]);
      }
    }

    return "";
  }


  //=================================================================================
  getCsvField(script, offset, stops) {
    if (script === "" || script === null || offset === 0) return "";

    var args = script.split(stops);

    if (args.length === 0 || args.length < offset) return "";

    return args[offset - 1].trim();
  }


  //==================================================================================
  ltrim(str, char) {

    if (str.slice(0, char.length) !== char) return str;

    return this.ltrim(str.slice(char.length), char);
  }


  //==================================================================================
  rtrim(str, char) {
    if (str.slice(str.length - char.length) !== char) return str;

    return this.rtrim(str.slice(0, 0 - char.length), char);
  }


  //==================================================================================
  getFileName(path) {
    return path.split(/[\\/]/).pop();  // extract file name from full path ...
  }


  //==================================================================================
  getBaseName(path) {
    var filename = this.getFileName(path);  // extract file name from full path ...

    var pos = filename.lastIndexOf(".");       // get last position of `.`

    if (pos != -1) filename = filename.substring(0, pos);

    return filename;
  }


  //==================================================================================
  getExtension(path) {
    var filename = this.getFileName(path);  // extract file name from full path ...

    var pos = filename.lastIndexOf(".");       // get last position of `.`

    if (filename === "" || pos < 1)            // if file name is empty or ...
      return "";                             //  `.` not found (-1) or comes first (0)

    return filename.slice(pos + 1);            // extract extension ignoring `.`
  }
}
