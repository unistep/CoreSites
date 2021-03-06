import { Component, Injector, AfterViewInit  } from '@angular/core';
import { BaseFormComponent } from '../templates/base-form.component';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})

export class FetchDataComponent extends BaseFormComponent implements AfterViewInit {
  public forecasts: WeatherForecast[];

  constructor(inject: Injector) {
    super(inject);
  }

  async ngAfterViewInit() {
    const response = await this.ufw.get('weatherforecast');

    if (response) this.forecasts = response;

    this.setDeviceProperties();
  }
}

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}
