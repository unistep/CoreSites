
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-date-row',
  templateUrl: './date-row.component.html',
  styleUrls: ['./date-row.component.css']
})

export class DateRowComponent {
  public   date: string;

  @Input() elementID: string;
  @Input() label: string;
  @Input() boundColumn: string;
  @Input() isReadOnly: string = 'true';
  @Input() icon: string;
}
