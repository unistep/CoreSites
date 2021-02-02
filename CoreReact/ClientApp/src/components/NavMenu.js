
import React, { Component } from 'react';
import {Link, } from 'react-router-dom';

import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import { LoginMenu } from './api-authorization/LoginMenu';
import './NavMenu.css';
import { translate } from '../lib/services/u-language-codes.service'
import ufwX from '../lib/services/ufw-interface'
import ugsX from '../lib/services/u-generics.service'

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    ufw = null;
    ugs = null;

    constructor(props) {
        super(props);
        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            modal: false,
            ready: false
        };

        this.ufw = ufwX;
        this.ugs = ugsX;

        this.toggle = this.toggle.bind(this);
        this.onChange = this.onChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.closeNavbar = this.closeNavbar.bind(this);
    }

    componentDidMount() {
        this.ufw.setLanguage();
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }


    closeNavbar() {
        this.setState({
            collapsed: true
        });
    }


    getKnownLanguages() {
        var arr = [];
        for (let i = 0; i < this.ugs.languageCodes.knownLanguages.length; i++) {
            var valueX = this.ugs.languageCodes.knownLanguages[i];
            if (valueX === this.ugs.languageCodes.selectedLanguage) {
                //arr.push(<option key={valueX} value="{valueX}" selected>{valueX}</option>);
                arr.push(<option key={valueX} defaultValue="{valueX}">{valueX}</option>);
            }
            else {
                arr.push(<option key={valueX} value="{valueX}">{valueX}</option>);
            }
        }

        return arr;
    }


    onChange(e) {
        var language = this.ugs.languageCodes.knownLanguages[e.target.selectedIndex];
        this.ufw.setLanguage(language);
    }


    toggle() {
        this.setState({
            modal: !this.state.modal
        });
    }

    getversion() {
        return this.ugs.Version;
    }
    //
    render() {
        console.log("nav render");

        return (
            <header>
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
                    <Container>
                        <NavbarBrand className="text-dark" style={{ whiteSpace: "nowrap", overflow: "auto" }} tag={Link} to="/">CoreReact</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
                            <ul className="navbar-nav flex-grow">
                                <NavItem>
                                    <select id='Selectlang' className='form-control select-items' onChange={this.onChange}>
                                        {this.getKnownLanguages()}
                                    </select>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/" onClick={this.closeNavbar}>{translate('Home')}</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink to="" className="text-dark" onClick={this.toggle}> {translate('About')}
                                    </NavLink>
                                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                                        <ModalHeader toggle={this.toggle}>{translate('About')}</ModalHeader>
                                        <ModalBody>
                                            <div className="input-group">
                                                <label className="label-align-natural" >{translate('About_Page_Content')}</label>
                                            </div>
                                            <div className="row form-group col-12">
                                                <div className="col-2 input-group">
                                                    <label className="label-align-natural">{translate('Version')}: </label>
                                                </div>
                                                <div className="col-2 input-group">
                                                    <label className="label-align-natural" >{this.getversion()}</label>
                                                </div>
                                            </div>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color='secondary' onClick={this.toggle}>Cancel</Button>
                                        </ModalFooter>
                                    </Modal>
                                </NavItem>
                                <NavItem className="servicecall">
                                    <NavLink tag={Link} className="text-dark" to="/servicecallX" onClick={this.closeNavbar}>Service call</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/counter" onClick={this.closeNavbar}>Counter</NavLink>
                                </NavItem>
                                <NavItem className="timeclock">
                                    <NavLink tag={Link} className="text-dark" to="/timeclock" onClick={this.closeNavbar}>{translate('Time_Clock')}</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={Link} className="text-dark" to="/fetch-data" onClick={this.closeNavbar}>Fetch data</NavLink>
                                </NavItem>
                                <LoginMenu>
                                </LoginMenu>
                            </ul>
                        </Collapse>
                    </Container>
                </Navbar>
            </header>
        );
    }
}
