
import React, { Component } from 'react';
//import { Redirect } from "react-router-dom";
//import { BaseFormComponent } from '../templates/BaseFormComponent';

import ufwX from '../services/ufw-interface'
import { translate } from '../services/u-language-codes.service';

import * as $ from 'jquery';


export class TimeClockComponent extends Component {
	state = { redirect: null };
    exitButton ="Entrance";
	inputPlaceholder="";
    labelLastReported ="Departure";

	isChecked  = false;
	userName="";
    bfc=null;
    udb=null;
    gmap=null;
	constructor() {
        super();
        var ufw = ufwX;
        this.bfc = ufw.bfc;
        this.udb = ufw.udb;
        this.gmap = ufw.gmap;
        this.doEnterExit = this.doEnterExit.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
     }


	//=================================================================================
    componentDidUpdate() {
        var elem = $(document).find('NavItem.timeclock');
        if (elem && elem.style) {
            elem[0].style.display = "none";
        }
    this.gmap.getMyLocation('current_location_eid');
	}

    //=================================================================================
    componentDidMount() {
        //var loginLA = document.getElementById("user_login_eid");
        //if (!loginLA || this.isChecked) return;

        this.isChecked = true;
        //this.userName = loginLA.innerText.replace("Hello ", "");

        this.bfc.ufw.TimeClock(this.formInit, 'view_key_value=avivs@unistep.co.il');
    }

	//=================================================================================
    componentWillUnmount() {
        this.udb.confirmExit();
        var elem = $(document).find('NavItem.timeclock');
        if (elem && elem.style) {
            elem[0].style.display = "block";
        }

       // $(document).find('NavItem.timeclock')[0].style.display = "block";
	}


	//=================================================================================
	formInit(scData, autoUpdate) {
		this.bfc.setsScreenProperties();
		this.bfc.formInit(scData, autoUpdate,this, null);
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
      + ` VALUES (1, '${this.userName}', '${newReport}', '${this.gmap.current_location}', '${this.gmap.current_address}')`;

        this.bfc.ufw.webRequest(null, null, "WebProcedure", 'Time_Clock', stmt);
		//this.setState({ redirect: "/" });
	}
	render() {
		return (
            <div className="container" >
                <div className="rframe">
                    <h3 style={{ textDecorationLine: 'none' }}>{translate('Time_Clock')}</h3>
                     <div className="tframe">
                        <div id="eid_cart_row" className="form-horizontal">
                            <div className="row form-group col-12">
                                <label className="col-12 label-align-center">{translate('Last_Reported')}</label>
                            </div>
                            <div className="row form-group col-12">
                                <div className="col-4 label-align-opposite">
                                    <label id="entrance_label_eid">{translate(this.labelLastReported)}</label>
                                </div>
                                <div className="col-8">
                                    <div className="input-group">
                                        <input id="entrance_input_eid" type="text"
                                            className="form-control r_input" readOnly data-bind="Time_Reported"
                                            placeholder='{translate(this.inputPlaceholder)}' />
                                        <span className="input-group-addon"><i className="fa fa-clock-o icon-align-opposite" aria-hidden="true"></i></span>
                                    </div>
                                </div>
                            </div>

                            <div className="row form-group col-12"></div>
                            <div className="row form-group col-12"></div>
                            <div className="row form-group col-12">
                                <label className="col-12 label-align-center">{translate('New_Report')}</label>
                            </div>
                            <div className="row form-group col-12">
                                <div className="col-4"></div>
                                <div className="col-4">
                                    <div className="input-group">
                                        <input type="button" className="btn btn-primary btn-block r_input"
                                            value={translate(this.exitButton)}
                                            id="eid_btn_exit" style={{ textAlign: 'center'}}
                                            onClick={this.doEnterExit} />
                                        <span className="input-group-addon">
                                            <i className="fa fa-sign-out icon-align-opposite" style={{color: 'white'}} aria-hidden="true"></i>
                                        </span>
                                    </div>
                                </div>
                                <div className="col-4"></div>
                                <div className="row form-group col-12">
                                    <label id="current_location_eid" className="col-12 label-align-center"
                                        style={{ textDecorationLine:'underline', fontWeight: 'bold'}}>Here</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		);
	}
}
