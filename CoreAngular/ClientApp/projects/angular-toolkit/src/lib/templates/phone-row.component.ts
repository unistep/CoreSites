import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-phone-row',
    templateUrl: './phone-row.component.html'
})
/** phone-row component*/
export class PhoneRowComponent {
  @Input() elementID: string;
  @Input() label: string;
  @Input() boundColumn: string;
  @Input() attributes: string;
  @Input() icon: string;
}
