import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import 'bootstrap/dist/css/bootstrap.css';

export class Layout extends Component {
  static displayName = Layout.name;

  render () {
    return (
      <div>
        <NavMenu />
            <Container>
                <div>
                    {this.props.children}
                 </div>
        </Container>
      </div>
    );
  }
}
