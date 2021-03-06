
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

//import { BDirModule } from 'ngx-bdir';

import { AppComponent } from './app.component';
import { AppMenuComponent } from './app-menu/app-menu.component';
import { HomeComponent } from './home/home.component';

import { UGenericsService, UResponsiveService } from '../../../angular-toolkit/src/public-api';
import { UfwInterface, UDbService, UGmapsService } from '../../../angular-toolkit/src/public-api';
import { ULocalization, LocalePipe } from '../../../angular-toolkit/src/public-api';
import { BaseNavMenuComponent, BaseFormComponent } from '../../../angular-toolkit/src/public-api';

import { AboutComponent } from '../../../angular-toolkit/src/public-api';
import { AddressRowComponent } from '../../../angular-toolkit/src/public-api';
import { ButtonRowComponent } from '../../../angular-toolkit/src/public-api';
import { DateRowComponent } from '../../../angular-toolkit/src/public-api';
import { InputRowComponent } from '../../../angular-toolkit/src/public-api';
import { PhoneRowComponent } from '../../../angular-toolkit/src/public-api';
import { SelectRowComponent } from '../../../angular-toolkit/src/public-api';

import { TimeClockComponent, CounterComponent, FetchDataComponent } from '../../../angular-toolkit/src/public-api';

@NgModule({
  declarations: [
    LocalePipe,
    AppComponent,
    AppMenuComponent,
    HomeComponent,
    BaseFormComponent,
    BaseNavMenuComponent,
    CounterComponent,
    FetchDataComponent,
    TimeClockComponent,
    AboutComponent,
    AddressRowComponent,
    ButtonRowComponent,
    DateRowComponent,
    InputRowComponent,
    PhoneRowComponent,
    SelectRowComponent
  ],
  imports: [
    NgbModule,
    NgSelectModule,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    //BDirModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'time-clock', component: TimeClockComponent }
    ]),
  ],

  providers: [
    HttpClient,
    UDbService, UGmapsService, UGenericsService,
    UResponsiveService, ULocalization, UfwInterface
  ],

  bootstrap: [AppComponent]
})

export class AppModule { }
