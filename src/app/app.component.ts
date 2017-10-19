import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IFormConfig } from '../lib/configuratble-form/configurable-form.interfaces';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';
    config: Observable<IFormConfig>;
    dataProviders: {
        selectCity: Observable<{ cityId: number; cityName: string }[]>,
        country: Observable<{ name: string; population: string, flag: string }[]>
    };

    constructor(private _http: Http) {
        this.config = this._http.get(
            '/assets/first-form.config.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json());
        this.dataProviders = {
            'selectCity': Observable.of([
                {
                    cityId: 0,
                    cityName: 'Cluj',
                },
                {
                    cityId: 1,
                    cityName: 'Bucuresti',
                },
                {
                    cityId: 2,
                    cityName: 'Iasi',
                }
            ]),
            'country': Observable.of([
                {
                    name: 'Arkansas',
                    population: '2.978M',
                    // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
                    flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg'
                },
                {
                    name: 'California',
                    population: '39.14M',
                    // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
                    flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg'
                },
                {
                    name: 'Florida',
                    population: '20.27M',
                    // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
                    flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg'
                },
                {
                    name: 'Texas',
                    population: '27.47M',
                    // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
                    flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg'
                }
            ])
        };
    }
}
