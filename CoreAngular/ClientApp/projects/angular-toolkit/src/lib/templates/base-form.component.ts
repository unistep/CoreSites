
import { Component, Injector  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UDbService } from '../services/u-db.service';
import { UGmapsService } from '../services/u-gmaps.service';
import { UGenericsService } from '../services/u-generics.service';
import { UfwInterface } from '../services/ufw-interface';

import * as $ from 'jquery';

@Component({
  templateUrl: './base-form.component.html',
  selector: 'app-base-form'
})

export class BaseFormComponent {
  public http: HttpClient = null;
  public router: Router = null;
  public gmaps: UGmapsService = null;
  public ugs: UGenericsService = null;
  public udb: UDbService = null;
  public ufw: UfwInterface = null;

	public  primary_table_name = '';
	public  primary_table_columns = [];
	public  splitDir = localStorage.getItem('direction');

  constructor(injector: Injector) {

    this.http = injector.get(HttpClient);
    this.router = injector.get(Router);
    this.gmaps = injector.get(UGmapsService);
    this.ugs = injector.get(UGenericsService);
    this.udb = injector.get(UDbService);
    this.ufw = injector.get(UfwInterface);
  }

  public formInit(scData, autoUpdate, setNavBar) {
    this.udb.setNavigationBar(setNavBar);

    this.udb.prepareDatasets(scData);
    this.udb.autoUpdate = autoUpdate; // Binding procedure should sync data with server
    this.udb.bindData(this);

    $('#eid_main_table tr td').click(this.mainTableClicked.bind(this));
		this.setMainTableCursor();
  }

  setsScreenProperties(){
    this.ugs.setsScreenProperties();
  }

	//=================================================================================
	mainTableClicked(e) {
		if (!this.udb.onAboutToNavigate()) return;

		this.udb.recordPosition = e.currentTarget.parentNode.rowIndex - 1;
		this.udb.bindData();

		this.setMainTableCursor();
	}

	//=================================================================================
	public setMainTableCursor() {
		const table: any = document.getElementById('eid_main_table');
		if (!table) return;
		let cells = table.getElementsByTagName('td');

		for (let i = 0; i < cells.length; i++) {
			cells[i].classList.remove('high-light');
		}

		cells = table.rows[this.udb.recordPosition + 1].getElementsByTagName('td');
		for (let i = 0; i < cells.length; i++) {
			cells[i].classList.add('high-light');
		}
	}
}

