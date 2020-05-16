import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-address-row',
  templateUrl: './address-row.component.html'
})
/** address-row component*/
export class AddressRowComponent {
  @Input() elementID: string;
  @Input() label: string;
  @Input() boundColumn: string;
  @Input() isReadOnly: string = 'true';
  @Input() icon: string;
}
