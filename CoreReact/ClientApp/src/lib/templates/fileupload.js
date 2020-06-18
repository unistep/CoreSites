
import React from 'react';
//import { post } from 'axios';
//import ufw from '../../lib/services/ufw-interface';

export class Fileupload extends React.Component {

    constructor(props) {
    super(props);

        this.state = {
            file: '',
        };
     }

    render() {

    return (
        <div className="cameraFrame">
            <i className="fa fa-camera"></i>
            <div className="cameraPhoto"></div>
            <input type="file" accept="image/*" capture data-file={this.props.datafile} />
        </div>
        )
    }
}
