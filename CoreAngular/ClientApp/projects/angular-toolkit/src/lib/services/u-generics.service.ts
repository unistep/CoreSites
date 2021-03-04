
import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ULocalization } from './u-localizaion.service';

import * as $ from 'jquery';
declare var $: any;

@Injectable()
export class UGenericsService {
  public pageLoad: boolean = false;

  //===================================================
  constructor(public deviceDetector: DeviceDetectorService,
    public locale: ULocalization) {
  }

  isLandscape() {
    return (window.innerHeight <= window.innerWidth);
  }

  isPortrait() {
    return (window.innerHeight > window.innerWidth);
  }

  isMobileLayout() {
    return this.deviceDetector.isMobile() ||
      (this.deviceDetector.isTablet() && this.isPortrait());
  }

  isDesktopLayout() {
    return this.deviceDetector.isDesktop() ||
      (this.deviceDetector.isTablet() && this.isLandscape());
  }

  //=================================================================================
  public getLocalStorageItem(itemName) {
    var item = localStorage.getItem(itemName);
    if (!item || item === "undefined") item = "";
    return item;
  }

  //=================================================================================
  public setsScreenProperties(): void {
    $('body').append("<div id=eid_status_line></div>");

    window.addEventListener("load", function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });

    var self = this;

    this.pageLoad = true;

    $(window).on("orientationchange", function () {
      if (!self.pageLoad) window.location.reload();
      self.pageLoad = false;
    });

    $(document).click(function () {
      this.Loger("");
    }.bind(this));

    $(window).on('resize', function () {
      this.resizeWindow();
    }.bind(this));

    this.resizeWindow();
  }

  //=================================================================================
  public resizeWindow() {
    if (!this.deviceDetector || !this.deviceDetector.os) return;

    // this.Loger((this.isPortrait() ? "portrait" : "landscape") + '; '
    //   + this.deviceDetector.os + "; "
    //   + this.deviceDetector.browser + "; "
    //   + screen.height + '; '
    //   + screen.width + '; '
    //   + window.innerHeight + '; '
    //   + window.innerWidth, true);

    if (this.isMobileLayout()) {
      var link = document.createElement('link');
      link.id = 'elm_mobile_style';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/assets/css/styles-mobile.css';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    else {
      var element = document.getElementById("elm_mobile_style");
      if (element) element.parentNode.removeChild(element);
    }

    if (this.deviceDetector.os.match('Windows')) {
      if (this.deviceDetector.browser.match('Chrome')) {
        this.setWindows_Chrome();
      }
      return;
    }

    if (this.deviceDetector.os.match('iOS')) {
      if (this.deviceDetector.browser.match('Safari')) {
        this.setIOS_Safari();
      }
      if (this.deviceDetector.browser.match('Chrome')) {
        this.setIOS_Chrome();
      }
      return;
    }

    else if (this.deviceDetector.os.match('Android')) {
      if (this.deviceDetector.browser.match('Chrome')) {
        this.setAndroid_Chrome();
      }
      if (this.deviceDetector.browser.match('Samsung')) {
        this.setAndroid_Samsung();
      }
      return;
    }
  }


  //=================================================================================
  queryParam(param_name) {
    var query = window.location.search.substring(1);
    var params = query.split("&");

    for (var i = 0; i < params.length; i++) {
      var param_value = params[i].split("=");

      if (param_value[0] === param_name) {
        return decodeURI(param_value[1]);
      }
    }

    return "";
  }


  //=================================================================================
  fieldByPosition(script, offset, stops) {
    if (script === "" || script === null || offset === 0) return "";

    var args = script.split(stops);

    if (args.length === 0 || args.length < offset) return "";

    return args[offset - 1].trim();
  };


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


  //==================================================================================
  ltrim(char, str) {
    if (str.slice(0, char.length) === char) {
      return this.ltrim(char, str.slice(char.length));
    } else {
      return str;
    }
  }


  //==================================================================================
  rtrim(char, str) {
    if (str.slice(str.length - char.length) === char) {
      return this.rtrim(char, str.slice(0, 0 - char.length));
    } else {
      return str;
    }
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


  //=================================================================================
  setIOS_Safari() {
    if (this.isPortrait()) {
			$('body').css({ 'max-height': '89vh' });
			$('.main_frame').css({ 'max-height': '77vh', 'min-height': '77vh', 'height': '77vh' });
			$('.lframe,.rframe').css({ 'max-height': '75vh', 'min-height': '75vh', 'height': '75vh' });
			$('.tframe,#mapcanvas').css({ 'max-height': '64vh', 'min-height': '64vh', 'height': '64vh' });
		}
		else { // Landscape
			$('body').css({ 'max-height': '87vh' });
			$('.main_frame').css({ 'max-height': '70vh', 'min-height': '70vh', 'height': '70vh' });//blue
			$('.lframe,.rframe').css({ 'max-height': '67vh', 'min-height': '67vh', 'height': '67vh' });//green
			$('.tframe,#mapcanvas').css({ 'max-height': '51vh', 'min-height': '51vh', 'height': '51vh' });//red

      $('#eid_status_line').css({ 'position': 'absolute', 'bottom': '13vh', 'left': '1vw' });
		}
	}


	//=================================================================================
  setIOS_Chrome() {
    if (this.isPortrait()) {
			$('body').css({ 'max-height': '88vh' });
			$('.main_frame').css({ 'max-height': '78vh', 'min-height': '78vh', 'height': '78vh' });
			$('.lframe,.rframe').css({ 'max-height': '76vh', 'min-height': '76vh', 'height': '76vh' });
			$('.tframe,#mapcanvas').css({ 'max-height': '65vh', 'min-height': '65vh', 'height': '65vh' });
		}
    else { // Landscape
			$('body').css({ 'max-height': '91.5vh' });
			$('.main_frame').css({ 'max-height': '73vh', 'min-height': '73vh', 'height': '73vh' });//blue
			$('.lframe,.rframe').css({ 'max-height': '70vh', 'min-height': '70vh', 'height': '70vh' });//green
			$('.tframe,#mapcanvas').css({ 'max-height': '53vh', 'min-height': '53vh', 'height': '53vh' });//red
    }
	}

	//=================================================================================
  setAndroid_Samsung() {
    if (this.isPortrait()) {
			$('body').css({ 'max-height': '99vh' });
			$('.main_frame').css({ 'max-height': '88.5vh', 'min-height': '88.5vh', 'height': '88.5vh' });
			$('.lframe,.rframe').css({ 'max-height': '86vh', 'min-height': '86vh', 'height': '86vh' });
			$('.tframe,#mapcanvas').css({ 'max-height': '70vh', 'min-height': '70vh', 'height': '70vh' });
		}
    else { // Landscape
			$('body').css({ 'max-height': '99vh' });
			$('.main_frame').css({ 'max-height': '79vh', 'min-height': '79vh', 'height': '79vh' });
			$('.lframe,.rframe').css({ 'max-height': '75vh', 'min-height': '75vh', 'height': '75vh' });
			$('.tframe,#mapcanvas').css({ 'max-height': '60vh', 'min-height': '60vh', 'height': '60vh' });
		}
	}

	//=================================================================================
  setAndroid_Chrome() {
    if (this.isPortrait()) {
      $('body').css({ 'max-height': '92vh' });
      $('.main_frame').css({ 'max-height': '82vh', 'min-height': '82vh', 'height': '82vh' });
      $('.lframe,.rframe').css({ 'max-height': '80vh', 'min-height': '80vh', 'height': '80vh' });
      $('.tframe,#mapcanvas').css({ 'max-height': '66vh', 'min-height': '66vh', 'height': '66vh' });
    }
    else {
      $('body').css({ 'max-height': '84.5vh' });
      $('.main_frame').css({ 'max-height': '66vh', 'min-height': '66vh', 'height': '66vh' });
      $('.lframe,.rframe').css({ 'max-height': '62vh', 'min-height': '62vh', 'height': '62vh' });
      $('.tframe,#mapcanvas').css({ 'max-height': '48vh', 'min-height': '48vh', 'height': '48vh' });
    }
	}

  //=================================================================================
  setWindows_Chrome() {
    if (this.isPortrait()) {
      $('body').css({ 'max-height': '99vh' });
      $('.main_frame').css({ 'max-height': '93vh', 'min-height': '93vh', 'height': '93vh' });
      $('.lframe,.rframe').css({ 'max-height': '79vh', 'min-height': '79vh', 'height': '79vh' });
      $('.tframe,#mapcanvas').css({ 'max-height': '66vh', 'min-height': '66vh', 'height': '66vh' });
    }
    else {
      $('body').css({ 'max-height': '99vh' });
      $('.main_frame').css({ 'max-height': '88vh', 'min-height': '88vh', 'height': '88vh' });//blue
      $('.lframe,.rframe').css({ 'max-height': '87vh', 'min-height': '87vh', 'height': '87vh' });//green
      $('.tframe,#mapcanvas').css({ 'max-height': '72vh', 'min-height': '72vh', 'height': '72vh' });//red
    }
  }
}
