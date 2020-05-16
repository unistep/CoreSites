import { Component, Input } from '@angular/core';
@Component({
    selector: 'app-button-row',
    templateUrl: './button-row.component.html'
})

export class ButtonRowComponent {
  @Input() elementID: string;
  @Input() label: string;
  @Input() boundColumn: string;
  @Input() attributes: string;
  @Input() icon: string;

//buttonRowClicked(inputElement) {
//    if (!inputElement) return;

//    if (typeof(onButtonRowClicked) !== 'undefined' && typeof(onButtonRowClicked) === 'function') {
//      onButtonRowClicked(inputElement);
//    }
//  }
}
