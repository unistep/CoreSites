import React, { Component } from 'react';
import { translate } from '../services/u-language-codes.service';

export class ButtonRow extends Component {

    render() {
        //var readonly = true;
        //if (this.props.isReadOnly === 'false') readonly = false;
        var cls1 = this.props.icon + " icon-align-opposite ";
        return (
            <div className="row form-group col-12">
                <div className="col-4">
                    <div className="input-group">
                        <input type="button" className="btn btn-primary btn-block r_input clicked" value={translate(this.props.label)} />
                        <span className="input-group-addon">
                            <i className="{cls1} icon-align-opposite" style={{color: "white"}} aria-hidden="true"></i>
                        </span>
                    </div>
                </div>
                <div className="col-8">
                    <div className="input-group">
                        <input id={this.props.elementID} type="text" className="form-control r_input" data-bind={this.props.boundColumn}
                            placeholder={translate(this.props.label)}  dir="ltr" />
                        <span className="input-group-addon"><i className={cls1} aria-hidden="true"></i></span>
                    </div>
                </div>
            </div>
        )
    }
}
