import React, { Component } from 'react';
import { translate } from '../services/u-language-codes.service';
import DateTimePicker   from 'react-datetime-picker';

export class DateRow extends Component {
    state = {
        startDate: new Date()
    };
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange = date => {
        this.setState({
            startDate: this.state.startDate
        });
    };
 render() {
     var readonly = true;
     if (this.props.isReadOnly === 'false') readonly = false;
   return (
      <div className="col-8 input-group date">
          <div className="col-4 label-align-opposite">
              <label>{translate(this.props.label)}</label>
          </div>
          <div className="col-8 input-group date">
            <DateTimePicker id={this.props.elementID} calendarIcon={this.props.icon} locale={this.props.local}
              value={this.state.startDate} placeholder={translate(this.props.label)}
              disabled={readonly} className="form-control r_input" data-bind={this.props.boundColumn}
                  onChange={this.handleChange} />
           </div>
    </div>
 )
}
}
//<span className="input-group-addon"><i className={cls1} aria-hidden="true"></i></span>
//value = { this.props.boundColumn }
