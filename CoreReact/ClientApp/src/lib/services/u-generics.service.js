import { isMobile, isMobileOnly, isTablet, isChrome, osName, browserName } from 'react-device-detect';
import { ULanguageCodes, translate } from './u-language-codes.service';
import * as $ from 'jquery';

export class UGenericsService {
    pageLoad = false;

    msg_error = "";
    msg_no_value = "";
    msg_illegal_value = "";

    current_language = "";

    Version = "";

    knownLanguages = [];
    selectedLanguage = {};
    ufw_url = "";
    base_url = null;
    languageCodes = null;
    ufw = null;
    DT = {};

    //===================================================
    constructor(ufwX) {
        this.ufw = ufwX;
        this.DT.isMobileOnly = isMobileOnly;
        this.DT.isMobile = isMobile;
        this.DT.isTablet = isTablet;
        this.DT.isChrome = isChrome;
        this.DT.isMobileOnly = isMobileOnly;
        this.DT.os = osName;
        this.DT.browser = browserName;
        this.base_url = window.location.origin + '/';
        if (window.location.port === '4200') this.ufw_url = "https://localhost:444/";
        else this.ufw_url = this.base_url;
        this.languageCodes = new ULanguageCodes(this);
    }

    isLandscape() {
        return (window.innerHeight <= window.innerWidth);
    }

    isPortrait() {
        return (window.innerHeight > window.innerWidth);
    }

    isMobileLayout() {
        return this.DT.isMobile ||
            (this.DT.isTablet && this.isPortrait());
    }

    isDesktopLayout() {
        return this.DT.isDesktop ||
            (this.DT.isTablet && this.isLandscape());
    }

    //=================================================================================
    getLocalStorageItem(itemName) {
        var item = localStorage.getItem(itemName);
        if (!item || item === "undefined") item = "";
        return item;
    }

    //=================================================================================
    setsScreenProperties() {
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
    appparamsloded = false;
    setAppParams(parameters) {
        localStorage.setItem('AssemblyVersion', parameters.AssemblyVersion);
        localStorage.setItem('KnownLanguages', parameters.KnownLanguages);
        localStorage.setItem('Language', parameters.Language);
        localStorage.setItem('Endpoints', parameters.Endpoints);

        this.Version = localStorage.getItem('AssemblyVersion');

        const language = localStorage.getItem('language');


        ////var _defaultLanguage = localStorage.getItem('DefaultLanguage');
        //if (!_defaultLanguage) {
        //    _defaultLanguage = 'English';
        //}

        //var languageName = localStorage.getItem('language');
        //if (!(languageName) || (languageName === 'null')) {
        //    languageName = _defaultLanguage;
        //    localStorage.setItem('language', _defaultLanguage);
        //}
        var _knownLanguages = localStorage.getItem('KnownLanguages');
        if (_knownLanguages) {
            this.knownLanguages = JSON.parse(_knownLanguages);
            if (this.knownLanguages.length) {
                this.selectedLanguage = language;
            }
        }
        else {
            this.knownLanguages.push(language);
            this.selectedLanguage = language;
        }
        this.appparamsloded = true;
    }


    //=================================================================================
    resizeWindow() {
        if (!this.DT || !this.DT.os) return;

        // this.Loger((this.isPortrait() ? "portrait" : "landscape") + '; '
        //   + this.DT.os + "; "
        //   + this.DT.browser + "; "
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

        if (this.DT.os === 'Windows') {
            if (this.DT.browser==='Chrome') {
                this.setWindows_Chrome();
            }
            return;
        }

        if (this.DT.os === 'iOS') {
            if (this.DT.browser === 'Safari') {
                this.setIOS_Safari();
            }
            if (this.DT.browser === 'Chrome') {
                this.setIOS_Chrome();
            }
            return;
        }

        else if (this.DT.os ==='Android') {
            if (this.DT.browser === 'Chrome') {
                this.setAndroid_Chrome();
            }
            if (this.DT.browser === 'Samsung') {
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
    Loger(message, do_alert) {
        var status_line = document.getElementById('eid_status_line');
        while (status_line && status_line.firstChild) {
            status_line.removeChild(status_line.firstChild);
        }

        if (!message) {
            var _site_address =
                `<div id='eid_site_address' dir='ltr'>`
                + `<a href='${this.uTranslate("Developer_Site")}' `
                + `target='_blank'>Site by: &nbsp; ${this.uTranslate("Developer_Name")}</a></div>`;
            if (status_line) status_line.innerHTML = _site_address;
            return;
        }

        if (status_line) {
            var _status_message = ("<div id='eid_status_message' dir='ltr'></div>");
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

        if (pos !== -1) filename = filename.substring(0, pos);

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

    sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    //setInterval(tick, 1000);
    async  timeSensativeAction(timeout) { //must be async func
        //do something here
        await this.sleep(timeout) //wait 5 seconds
        //continue on...
    }
    //=================================================================================
    adjastUserLanguage(languageName) {
        var direction = 'ltr';
        document.getElementsByTagName('html')[0].removeAttribute('dir');

        if (languageName === 'Arabic' || languageName === 'Hebrew') { direction = 'rtl' }

        document.getElementsByTagName('html')[0].setAttribute('dir', direction);

        localStorage.setItem('direction', direction);
        localStorage.setItem('language', languageName);

        if (direction === "rtl") {
            var link = document.createElement('link');
            link.id = 'elm_rtl';
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = '/assets/css/styles-rtl.css';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        else {
            var element = document.getElementById("elm_rtl");
            if (element) element.parentNode.removeChild(element);
        }
        this.current_language = this.languageCodes.getCodeByName(languageName);
        console.log("this.current_language: " + this.current_language);
        //lang = await this.languageCodes.LoadLAng("assets/i18n/" + this.current_language + '.json');
        //if (lang) setCurrLang(lang);

        //this.timeSensativeAction(500);
        //const history = useHistory();
        // history.push(document.location.href);

    }

    //=================================================================================
    uTranslate(keyword) {
        keyword = translate(keyword);
        return keyword;
    }

    setSpinner(boolSet) {// on=true, off=false

        document.body.style.cursor = boolSet ? "wait" : "default";

        $('#eid_spinner').remove();
        if (!boolSet) return;

        var _spinner = "<div id='eid_spinner' class='spinner'>"
            + "<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i>"
            + "<span class='sr-only'>Loading...</span>"
            + "</div>";
        $('body').append(_spinner);
    }


    getEndpointUrl(endpointName) {
        if (!endpointName) return this.ufw_url;
        let endpoints = localStorage.getItem('Endpoints');
        if (!endpoints) return this.ufw_url;

        let endpointsJSON = JSON.parse(endpoints);
        for (let i = 0; i < endpointsJSON.length; i++) {
            if (endpointsJSON[i].EndpointName !== endpointName) continue;
            return endpointsJSON[i].EndpointUrl;
        }

        return this.ufw_url
    }

    getEndpointTO(endpointName) {
        if (!endpointName) return 30 * 1000;
        let endpoints = localStorage.getItem('Endpoints');
        if (!endpoints) return this.ufw_url;

        let endpointsJSON = JSON.parse(endpoints);
        for (let i = 0; i < endpointsJSON.length; i++) {
            if (endpointsJSON[i].EndpointName !== endpointName) continue;
            return Number(endpointsJSON[i].Timeout) * 1000;
        }

        return 30 * 1000;
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

    //
    //
    openFullscreen() {
        const elem = document.getElementById('root')
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    }
    //
    toggleFullScreen() {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

}

//const ugsX = new UGenericsService();
//export default ugsX;
