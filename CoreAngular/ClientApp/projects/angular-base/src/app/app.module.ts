
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BDirModule } from 'ngx-bdir';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json');
}

import { UDbService, UGmapsService, UGenericsService } from '../../../angular-toolkit/src/public-api';
import { ULocalization, UfwInterface } from '../../../angular-toolkit/src/public-api';
import { BaseFormComponent, TimeClockComponent } from '../../../angular-toolkit/src/public-api';
import { CounterComponent, FetchDataComponent } from '../../../angular-toolkit/src/public-api';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    TimeClockComponent,
    BaseFormComponent
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
    BDirModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'time-clock', component: TimeClockComponent },
    ]),

    DeviceDetectorModule.forRoot()
  ],
  providers: [
    HttpClient, UGenericsService, UDbService, UGmapsService, ULocalization, UfwInterface 
  ],
  
  bootstrap: [AppComponent]
})
export class AppModule { }
