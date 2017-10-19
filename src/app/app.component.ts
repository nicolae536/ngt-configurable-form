import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/filter';
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
    formSlot: string = "formSlot";
    currentValue$: Observable<any>;

    constructor(private _http: Http, private _store: Store<any>) {

        this._http.get(
            '/assets/first-form.config.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json())
            .subscribe(value => {
                this._store.dispatch({
                    type: "CONFIGURATION_CHANGE",
                    payload: {
                        "formName": this.formSlot,
                        "configuration": value
                    }
                });
            });
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

        this._store.select((state) => {
            if (state && state.simpleFormReducer && state.simpleFormReducer[this.formSlot] && state.simpleFormReducer[this.formSlot]["configuration"]) {
                return state.simpleFormReducer[this.formSlot]["configuration"];
            }
            return null;
        }).filter(v => !!v)
            .subscribe(v => {
                this.config = v;
            });
        this._store.select((state) => {
            if (state && state.simpleFormReducer && state.simpleFormReducer[this.formSlot] && state.simpleFormReducer[this.formSlot]["value"]) {
                return state.simpleFormReducer[this.formSlot]["value"];
            }
            return null;
        }).filter(v => !!v)
            .subscribe(v => {
                this.currentValue$ = v;
            });
    }

    handleConfigChange(event) {
        this._store.dispatch({
            type: "CONFIGURATION_CHANGE",
            payload: {
                "formName": this.formSlot,
                "configuration": event
            }
        });
    }

    handleValueChange(event) {
        this._store.dispatch({
            type: "VALUE_CHANGE",
            payload: {
                "formName": this.formSlot,
                "value": event
            }
        });
    }
}
