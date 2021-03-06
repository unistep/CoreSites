
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as $ from 'jquery';
declare var $: any;

//import { interval } from 'rxjs';
//import { take } from 'rxjs/operators';

@Injectable()
export class ULocalization {
  public  baseUrl = "";
  public  jsonLanguage = {};
  public  knownLanguages: any = [];
  public  selectedLanguage: any;


  //=================================================================================
  constructor(public http: HttpClient) {
  }


	//=================================================================================
  public setLanguageParams() {
    const language = localStorage.getItem('Language');

    var _knownLanguages = localStorage.getItem('KnownLanguages');
    if (_knownLanguages) {
      this.knownLanguages = JSON.parse(_knownLanguages);

      let i = 0;
      for ( ; i < this.knownLanguages.length; i++) {
        if (this.knownLanguages[i] === language) break;
      }

      if (i >= this.knownLanguages.length) {
        this.knownLanguages.push(language);
      }
    }

    this.selectedLanguage = language;

    this.adjastSelectedLanguage(false);
  }


  //=================================================================================
  public adjastSelectedLanguage(redraw) {
    var language = this.selectedLanguage;
    var direction = (language === 'Arabic' || language === 'Hebrew') ? 'rtl' : 'ltr';

    document.getElementsByTagName('html')[0].setAttribute('dir', direction);

    localStorage.setItem('direction', direction);
    localStorage.setItem('Language', language);

    if (direction == "rtl") {
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

    const httpOptions: any = { responseType: 'text' };
    const service = this.baseUrl + `SPA_ChangeLanguage?language=${language}`;

    const promise = this.http.get(service, httpOptions).toPromise();
    return promise.then((response: any) => {
      this.jsonLanguage = JSON.parse(response);
      if (!redraw) return;
      this.setSpinner(true);
      window.location.reload();
      //const refreshTimer = interval(50).pipe(take(1));
    }).catch(error => {
      window.console.log(error);
      window.alert(error);
    });
  }


  //=================================================================================
  uTranslate(key) {
    let result = this.jsonLanguage[key];
    return result ? result : key;
  }


  //=================================================================================
  public setSpinner(boolSet) {// on=true, off=false
    document.body.style.cursor = boolSet ? "wait" : "default";

    $('#eid_spinner').remove();
    if (!boolSet) return;

    var _spinner  = "<div id='eid_spinner' class='spinner'>"
                  + "<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i>"
                  + "<span class='sr-only'>Loading...</span>"
                  + "</div>";

    $('body').append(_spinner);
  }
}

//private languageCodes: any = [
//  { gid: "af", iid: "af", name: "Afrikaans" },
//  { gid: "sq", iid: "sq", name: "Albanian" },
//  { gid: "ar", iid: "ar", name: "Arabic" },
//  { gid: "hy", iid: "hy", name: "Armenian" },
//  { gid: "az", iid: "az", name: "Azerbaijani" },
//  { gid: "eu", iid: "eu", name: "Basque" },
//  { gid: "br", iid: "be", name: "Belarusian" },
//  { gid: "bs", iid: "bs", name: "Bosnian" },
//  { gid: "bg", iid: "bg", name: "Bulgarian" },
//  { gid: "ca", iid: "ca", name: "Catalan" },
//  { gid: "zh", iid: "zh", name: "Chinese" },
//  { gid: "hr", iid: "hr", name: "Croatian" },
//  { gid: "cs", iid: "cs", name: "Czech" },
//  { gid: "da", iid: "da", name: "Danish" },
//  { gid: "nl", iid: "nl", name: "Dutch" },
//  { gid: "en", iid: "en", name: "English" },
//  { gid: "eo", iid: "eo", name: "Esperanto" },
//  { gid: "tl", iid: "", name: "Filipino" },
//  { gid: "fi", iid: "fi", name: "Finnish" },
//  { gid: "fr", iid: "fr", name: "French" },
//  { gid: "gl", iid: "gl", name: "Galician" },
//  { gid: "ka", iid: "ka", name: "Georgian" },
//  { gid: "de", iid: "de", name: "German" },
//  { gid: "el", iid: "el", name: "Greek" },
//  { gid: "gu", iid: "gu", name: "Gujarati" },
//  { gid: "ht", iid: "ht", name: "Haitian" },
//  { gid: "iw", iid: "he", name: "Hebrew" },
//  { gid: "hi", iid: "hi", name: "Hindi" },
//  { gid: "hu", iid: "hu", name: "Hungarian" },
//  { gid: "is", iid: "is", name: "Icelandic" },
//  { gid: "id", iid: "id", name: "Indonesian" },
//  { gid: "ga", iid: "ga", name: "Irish" },
//  { gid: "it", iid: "it", name: "Italian" },
//  { gid: "ja", iid: "ja", name: "Japanese" },
//  { gid: "kn", iid: "kn", name: "Kannada" },
//  { gid: "kk", iid: "kk", name: "Kazakh" },
//  { gid: "km", iid: "km", name: "Khmer" },
//  { gid: "ko", iid: "ko", name: "Korean" },
//  { gid: "la", iid: "la", name: "Latin" },
//  { gid: "lv", iid: "lv", name: "Latvian" },
//  { gid: "lt", iid: "lt", name: "Lithuanian" },
//  { gid: "mk", iid: "mk", name: "Macedonian" },
//  { gid: "ms", iid: "ms", name: "Malay" },
//  { gid: "ml", iid: "ml", name: "Malayalam" },
//  { gid: "mt", iid: "mt", name: "Maltese" },
//  { gid: "mi", iid: "mi", name: "Maori" },
//  { gid: "mr", iid: "mr", name: "Marathi" },
//  { gid: "mn", iid: "", name: "Mongolian" },
//  { gid: "my", iid: "", name: "Myanmar (Burmese)" },
//  { gid: "ne", iid: "ne", name: "Nepali" },
//  { gid: "no", iid: "no", name: "Norwegian" },
//  { gid: "fa", iid: "fa-ir", name: "Persian" },
//  { gid: "pl", iid: "pl", name: "Polish" },
//  { gid: "pt", iid: "pt", name: "Portuguese" },
//  { gid: "pa", iid: "pa", name: "Punjabi" },
//  { gid: "ro", iid: "ro", name: "Romanian" },
//  { gid: "ru", iid: "ru", name: "Russian" },
//  { gid: "sr", iid: "sr", name: "Serbian" },
//  { gid: "st", iid: "", name: "Sesotho" },
//  { gid: "si", iid: "si", name: "Sinhala" },
//  { gid: "sk", iid: "sk", name: "Slovak" },
//  { gid: "sl", iid: "sl", name: "Slovenian" },
//  { gid: "so", iid: "so", name: "Somali" },
//  { gid: "es", iid: "es", name: "Spanish" },
//  { gid: "su", iid: "", name: "Sundanese" },
//  { gid: "sw", iid: "sw", name: "Swahili" },
//  { gid: "sv", iid: "sv", name: "Swedish" },
//  { gid: "tg", iid: "", name: "Tajik" },
//  { gid: "ta", iid: "ta", name: "Tamil" },
//  { gid: "te", iid: "te", name: "Telugu" },
//  { gid: "th", iid: "th", name: "Thai" },
//  { gid: "tr", iid: "tr", name: "Turkish" },
//  { gid: "uk", iid: "uk", name: "Ukrainian" },
//  { gid: "ur", iid: "ur", name: "Urdu" },
//  { gid: "vi", iid: "vi", name: "Vietnamese" },
//  { gid: "cy", iid: "cy", name: "Welsh" },
//  { gid: "yi", iid: "ji", name: "Yiddish" },
//  { gid: "yo", iid: "", name: "Yoruba" },
//  { gid: "zu", iid: "zu", name: "Zulu" }
//];


	//=================================================================================
  //public getCodeByName(languageName: any): string {
  //  var languageCode = this.languageCodes.find(item => item.name === languageName).gid;
  //  if (!languageCode) languageCode = 'en'
  //  return languageCode;
  //}


	//=================================================================================
  //public getNameByCode(languageCode: any): string {
  //  var languageName = this.languageCodes.find(item => item.gid === languageCode).name;
  //  if (!languageName) languageName = 'English'
  //  return languageName;
  //}


	//=================================================================================
  //public isValidLanguageName(languageName): boolean {
  //  languageName = this.languageCodes.find(item => item.gid === languageName).name;

  //  return (languageName !== null)
  //}


	//=================================================================================
  //public isValidLanguageCode(languageCode): boolean {
  //  languageCode = this.languageCodes.find(item => item.gid === languageCode).gid;

  //  return (languageCode !== null)
  //}

