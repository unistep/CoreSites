import React, { Component } from 'react';
import { Route } from 'react-router';
//import Moment from 'react-moment';
import 'moment-timezone';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import AuthorizeRoute from './components/api-authorization/AuthorizeRoute';
import ApiAuthorizationRoutes from './components/api-authorization/ApiAuthorizationRoutes';
import { ApplicationPaths } from './components/api-authorization/ApiAuthorizationConstants';
import { TimeClockComponent } from './lib/time-clock/time-clock.component';
import { ServiceCallComponent } from './components/service-call/service-call.component';
import { ShoppingCart} from '../src/components/service-call/shopping-cart.component';
import 'font-awesome/css/font-awesome.min.css';
import ufwX, { httpOptions }  from './lib/services/ufw-interface';

import './custom.scss'
//import { setCurrLang } from './lib/services/u-language-codes.service';


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false
        }
        this.UNSAFE_componentWillMount = this.UNSAFE_componentWillMount.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    async UNSAFE_componentWillMount() {
 
        console.log('App UNSAFE_componentWillMount');
    }

     getData() {
        console.log('Our data is fetched');
        this.setState({
            ready: true
        });
 }

    async componentDidMount() {
        console.log('app componentDidMount start');

        var u = ufwX;
        let url = `${u.ugs.getEndpointUrl("")}${"GetAppParams"}`;
        const response = await fetch(url, httpOptions);
        const json = await response.json();
        u.ugs.setAppParams(json);
        console.log('app componentDidMount end');


       await  this.getData();
    }
    static displayName = App.name;
    render() {
        console.log("App render");

    return (
      <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
            <AuthorizeRoute path='/fetch-data' component={FetchData} />
            <Route path='/timeclock' component={TimeClockComponent} />
            <Route path='/servicecallX' component={ServiceCallComponent} />
            <Route path='/shopingcard' component={ShoppingCart} />
        <Route path={ApplicationPaths.ApiAuthorizationPrefix} component={ApiAuthorizationRoutes} />
      </Layout>
    );
  }
}
