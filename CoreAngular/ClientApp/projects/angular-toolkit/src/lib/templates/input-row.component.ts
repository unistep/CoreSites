import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-input-row',
  templateUrl: './input-row.component.html'
})

export class InputRowComponent {
  @Input() elementID: string;
  @Input() label: string;
  @Input() boundColumn: string;
  @Input() isReadOnly: boolean = true;
  @Input() icon: string;
  @Input() inputType: string = 'text';
}
