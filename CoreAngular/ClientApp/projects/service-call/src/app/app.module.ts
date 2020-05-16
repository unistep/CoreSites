
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AngularSplitModule } from 'angular-split';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

import { DeviceDetectorModule } from 'ngx-device-detector';
import { BDirModule } from 'ngx-bdir';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';

import { UDbService, UGmapsService, UGenericsService } from '../../../angular-toolkit/src/public-api';
import { ULanguageCodes, UfwInterface } from '../../../angular-toolkit/src/public-api';
import { BaseFormComponent, TimeClockComponent } from '../../../angular-toolkit/src/public-api';
import { CounterComponent, FetchDataComponent } from '../../../angular-toolkit/src/public-api';

import { ApiAuthorizationModule } from '../api-authorization/api-authorization.module';
import { AuthorizeGuard } from '../api-authorization/authorize.guard';
import { AuthorizeInterceptor } from '../api-authorization/authorize.interceptor';

import { AddressRowComponent } from '../../../angular-toolkit/src/public-api';
import { ButtonRowComponent } from '../../../angular-toolkit/src/public-api';
import { DateRowComponent } from '../../../angular-toolkit/src/public-api';
import { InputRowComponent } from '../../../angular-toolkit/src/public-api';
import { PhoneRowComponent } from '../../../angular-toolkit/src/public-api';
import { SelectRowComponent } from '../../../angular-toolkit/src/public-api';

import { ServiceCallComponent } from './service-call/service-call.component';
import { ShoppingCartComponent } from './service-call/shopping-cart.component';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    TimeClockComponent,
	BaseFormComponent,
	AddressRowComponent,
	ButtonRowComponent,
	DateRowComponent,
	InputRowComponent,
	PhoneRowComponent,
	SelectRowComponent,
	ServiceCallComponent,
	ShoppingCartComponent,
  ],
  imports: [
	NgbModule,
	NgSelectModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    BDirModule,
    ApiAuthorizationModule,
	AngularSplitModule.forRoot(),
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent, canActivate: [AuthorizeGuard] },
      { path: 'time-clock', component: TimeClockComponent },
	  { path: 'service-call', component: ServiceCallComponent },
	  { path: 'shopping-cart', component: ShoppingCartComponent }
]),

    DeviceDetectorModule.forRoot()
  ],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true },
    HttpClient, UGenericsService, UDbService, UGmapsService, ULanguageCodes, UfwInterface
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }



