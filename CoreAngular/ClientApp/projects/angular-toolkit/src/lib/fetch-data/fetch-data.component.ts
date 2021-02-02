import { Component, Injector, AfterViewInit  } from '@angular/core';
import { BaseFormComponent } from '../templates/base-form.component';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent extends BaseFormComponent implements AfterViewInit{
  public forecasts: WeatherForecast[];

  constructor(inject: Injector){
    super(inject);
  }

  async ngAfterViewInit() {
    const response = await this.ufw.get('weatherforecast');

    if (response) this.forecasts = response;

    this.setsScreenProperties();
    //this.http.get<WeatherForecast[]>(this.ugs.ufw_url + 'weatherforecast').subscribe(result => {
    //  this.forecasts = result;
    //}, error => this.ugs.Loger(error, true));
  }
}

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
