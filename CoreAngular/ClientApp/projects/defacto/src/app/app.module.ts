
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WebcamModule } from 'ngx-webcam';

import { AppComponent } from './app.component';
import { AppMenuComponent } from './app-menu/app-menu.component';
import { HomeComponent } from './home/home.component';

import { UGenericsService, UResponsiveService } from '../../../angular-toolkit/src/public-api';
import { UfwInterface, UDbService, UGmapsService } from '../../../angular-toolkit/src/public-api';
import { ULocalization, LocalePipe } from '../../../angular-toolkit/src/public-api';
import { BaseNavMenuComponent, BaseFormComponent } from '../../../angular-toolkit/src/public-api';

import { TimeClockComponent } from '../../../angular-toolkit/src/public-api';

import { AboutComponent } from '../../../angular-toolkit/src/public-api';
import { AddressRowComponent } from '../../../angular-toolkit/src/public-api';
import { ButtonRowComponent } from '../../../angular-toolkit/src/public-api';
import { DateRowComponent } from '../../../angular-toolkit/src/public-api';
import { InputRowComponent } from '../../../angular-toolkit/src/public-api';
import { PhoneRowComponent } from '../../../angular-toolkit/src/public-api';
import { SelectRowComponent } from '../../../angular-toolkit/src/public-api';

import { LoginComponent } from '../app/Entrance/login.component';
import { ServiceCallComponent } from './service-call/service-call.component';
import { CustomerFindComponent } from './service-call/customer-find.component';
import { CustomerRegisterComponent } from './service-call/customer-register.component';
import { NewServiceCallComponent } from './service-call/new-service-call.component';
import { EditServiceCallComponent } from './service-call/edit-service-call.component';
import { TakePhotoComponent } from './take-photo/take-photo.component';
import { PosPopupComponent } from './pos-popup/pos-popup.component';


@NgModule({
  declarations: [
    LocalePipe,
    AppComponent,
    AppMenuComponent,
    HomeComponent,
    BaseFormComponent,
    BaseNavMenuComponent,
    AboutComponent,
    TimeClockComponent,
    AddressRowComponent,
    ButtonRowComponent,
    DateRowComponent,
    InputRowComponent,
    PhoneRowComponent,
    SelectRowComponent,
    LoginComponent,
    ServiceCallComponent,
    CustomerFindComponent,
    CustomerRegisterComponent,
    NewServiceCallComponent,
    EditServiceCallComponent,
    BaseFormComponent,
    TakePhotoComponent,
    PosPopupComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule,
    WebcamModule,
    RouterModule.forRoot([
      { path: '', component: LoginComponent, pathMatch: 'full' },
      { path: 'Entrance', component: LoginComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'service-call', component: ServiceCallComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'customer-find', component: CustomerFindComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'new-service-call', component: NewServiceCallComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'edit-service-call', component: EditServiceCallComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'customer-register', component: CustomerRegisterComponent/*, canActivate: [AuthorizeGuard]*/ }
    ]),
  ],
  providers: [
    HttpClient,
    UDbService, UGmapsService, UGenericsService,
    UResponsiveService, ULocalization, UfwInterface, AppMenuComponent
  ],
  bootstrap: [AppComponent],
  entryComponents: [PosPopupComponent, TakePhotoComponent]
})
export class AppModule { }
