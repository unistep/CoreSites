
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { DeviceDetectorModule } from 'ngx-device-detector';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WebcamModule } from 'ngx-webcam';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BDirModule } from 'ngx-bdir';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

import { UDbService, UGmapsService, UGenericsService } from '../../../angular-toolkit/src/public-api';
import { ULanguageCodes, UfwInterface } from '../../../angular-toolkit/src/public-api';
import { BaseFormComponent } from '../../../angular-toolkit/src/public-api';

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
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    BaseFormComponent,
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
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule,
    WebcamModule,
    BDirModule,
    RouterModule.forRoot([
      { path: '', component: LoginComponent, pathMatch: 'full' },
      { path: 'Entrance', component: LoginComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'service-call', component: ServiceCallComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'customer-find', component: CustomerFindComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'new-service-call', component: NewServiceCallComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'edit-service-call', component: EditServiceCallComponent/*, canActivate: [AuthorizeGuard]*/ },
      { path: 'customer-register', component: CustomerRegisterComponent/*, canActivate: [AuthorizeGuard]*/ }
    ]),

    DeviceDetectorModule.forRoot()
  ],
  providers: [
    HttpClient, UGenericsService, UDbService, UGmapsService, ULanguageCodes, UfwInterface,
    NavMenuComponent
  ],
  bootstrap: [AppComponent],
  entryComponents: [PosPopupComponent, TakePhotoComponent]
})
export class AppModule { }
