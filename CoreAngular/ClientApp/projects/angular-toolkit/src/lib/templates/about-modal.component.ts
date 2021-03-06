import { Component, Input } from '@angular/core';

import * as $ from 'jquery';
declare var $: any;

@Component({
  selector: 'about-modal',
  templateUrl: './about-modal.component.html'
})

export class AboutComponent {
  @Input() version: string;

  public OnAboutDone() {
    $("#about-modal .close").click()
  }
}
