import React, { Component } from 'react';
import { translate } from '../services/u-language-codes.service';

export class PhoneRow extends Component {

 render() {
    var cls1 = "icon-align-opposite";
    if (this.props.icon) cls1 = this.props.icon + " "  + cls1;
    return (
 <div className="row form-group col-12">
    <div className="col-4 label-align-opposite">
        <label>{translate(this.props.label)}</label>
    </div>
    <div className="col-8">
        <div className="input-group">
            <a id={this.props.elementID} className="form-control r_input" href='tel:054719547'>0524871400</a>
                        <span className="input-group-addon"><i className={cls1} aria-hidden="true"></i></span>
        </div>
    </div>
</div>


        )
    }
}
