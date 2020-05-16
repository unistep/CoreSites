import React from 'react';
import { post } from 'axios';
import ufwX from '../../lib/services/ufw-interface';

export class Fileupload extends React.Component {
    ufw = null;
    constructor(props) {
    super(props);
    this.ufw = ufwX;

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
