import { Component, Input } from '@angular/core';


@Component({
	selector: 'app-select-row',
	templateUrl: './select-row.component.html'
})

export class SelectRowComponent {
	@Input() elementID: string;
	@Input() label: string;
	@Input() boundColumn: string;
	@Input() attributes: string;
	@Input() icon: string;
}
