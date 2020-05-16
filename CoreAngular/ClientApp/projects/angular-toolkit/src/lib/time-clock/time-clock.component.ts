
import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { BaseFormComponent } from '../templates/base-form.component';

import * as $ from 'jquery';
declare var $: any;

@Component({
	selector: 'app-time-clock',
	templateUrl: './time-clock.component.html',
	styleUrls: ['./time-clock.component.scss']
})

export class TimeClockComponent extends BaseFormComponent implements AfterViewInit, OnInit, OnDestroy {

	exitButton: any;
	inputPlaceholder: any;
	labelLastReported: any;

	public isChecked: boolean = false;
	userName: any;


	//=================================================================================
	ngOnInit(): void {
    $(document).find('li.timeclock')[0].style.display = "none";
    this.gmaps.getMyLocation('current_location_eid');
	}


	//=================================================================================
	ngOnDestroy(): void {
		this.udb.confirmExit();
		$(document).find('li.timeclock')[0].style.display = "block";
	}


	//=================================================================================
	formInit(scData, autoUpdate) {
		super.setsScreenProperties();
		super.formInit(scData, autoUpdate, null);
		}
	

  //=================================================================================
   async ngAfterViewInit() {
		//var loginLA = document.getElementById("user_login_eid");
		//if (!loginLA || this.isChecked) return;

		this.isChecked = true;
		//this.userName = loginLA.innerText.replace("Hello ", "");

     var result = await this.ufw.TimeClock('view_key_value=avivs@unistep.co.il');
     if (!result) return;

     this.formInit (result, false);
	}


  //=================================================================================
	afterBinding() {
		var actionType = this.udb.getDatasetColumnValue("Time_Clock", 0, "Action_Type");
		if (actionType !== "Entrance") {
			this.labelLastReported = "Departure";
			this.inputPlaceholder = "Departure";
			this.exitButton = "Entrance";
		}
		else {
			this.labelLastReported = "Entrance";
			this.inputPlaceholder = "Entrance";
			this.exitButton = "Departure";
		}
	}


	//=================================================================================
	doEnterExit() {
		var lastReported = this.udb.getDatasetColumnValue("Time_Clock", 0, "Action_Type");
		var newReport = (lastReported !== "Entrance") ? "Entrance" : "Departure";

		var stmt = "INSERT INTO Time_Clock (Technician, User_Login, Action_Type, LatLng, Address_Reported) "
      + ` VALUES (1, '${this.userName}', '${newReport}', '${this.gmaps.current_location}', '${this.gmaps.current_address}')`;

		this.ufw.webRequest(null, null, "WebProcedure", 'Time_Clock', stmt);
		this.router.navigate(['']);
	}
}
