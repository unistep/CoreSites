
import React from 'react';
import { Redirect } from "react-router-dom";

import { BaseFormComponent } from '../templates/BaseFormComponent';

import { translate } from '../services/u-language-codes.service';

export class TimeClockComponent extends BaseFormComponent {
    state = { redirect: null };
    userName = "avivs@unistep.co.il";

    constructor() {
        super();

        this.doEnterExit = this.doEnterExit.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
     }


    //=================================================================================
    componentDidMount() {
        this.setsScreenProperties();

        const elem = document.getElementsByClassName('timeclock');
        if (elem && elem.style) elem[0].style.display = "none";

        this.gmap.getMyLocation('current_location_eid');

        this.ufw.TimeClock(getData, `view_key_value=${this.userName}`);

        const self = this;
        function getData(response) {
            self.formInit(response, false, this, null);
            self.afterBinding();
        }
    }

	//=================================================================================
    componentWillUnmount() {
        this.udb.confirmExit();
	}


    //=================================================================================
    afterBinding() {
        const actionButton = document.getElementById('eid_btn_exit');
        const actionLabel  = document.getElementById('entrance_label_eid');
        const actionInput = document.getElementById('entrance_input_eid');

        var actionType = this.udb.getDatasetColumnValue("Time_Clock", 0, "Action_Type");
        if (actionType === "Entrance") {
            actionButton.value = translate('Departure');
            actionLabel.innerText = translate('Entrance');
            actionInput.placeholder = translate('Entrance');
		}
		else {
            actionButton.value = translate('Entrance');
            actionLabel.innerText = translate('Departure');
            actionInput.placeholder = translate('Departure');
		}
    }
    
 	//=================================================================================
	doEnterExit() {
        const lastReported = this.udb.getDatasetColumnValue("Time_Clock", 0, "Action_Type");
		const newReport = (lastReported !== "Entrance") ? "Entrance" : "Departure";

		var stmt = "INSERT INTO Time_Clock (Technician, User_Login, Action_Type, LatLng, Address_Reported) "
            + ` VALUES (1, '${this.userName}', '${newReport}', '${this.gmap.current_location}', '${this.gmap.current_address}')`;

        this.ufw.WebProcedure('Time_Clock', stmt);
        this.setState({ redirect: "/" });
    }

	render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }

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
                                    <label id="entrance_label_eid"></label>
                                </div>
                                <div className="col-8">
                                    <div className="input-group">
                                        <input id="entrance_input_eid" type="text"
                                            className="form-control r_input" readOnly data-bind="Time_Reported"
                                            placeholder="" />
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
                                            value=""
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
