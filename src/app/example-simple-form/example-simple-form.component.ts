import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IFormConfig } from '../../lib/configuratble-form/configurable-form.interfaces';
import { STATES, CITYES } from './example-simple.consts';

@Component({
    moduleId: module.id,
    selector: 'ngt-example-simple-form',
    templateUrl: 'example-simple-form.html',
    encapsulation: ViewEncapsulation.None
})
export class ExampleSimpleFormComponent {
    config: Observable<IFormConfig>;
    dataProviders: {
        selectCity: Observable<{ cityId: number; cityName: string }[]>,
        country: Observable<{ name: string; population: string, flag: string }[]>
    };
    formSlot: string = "formSlot";
    currentValue$: Observable<any>;
    isValid: boolean;

    constructor(private _http: Http, private _store: Store<any>) {

        let testData = '/assets/first-form.config.json';
        let testDataReq = '/assets/layout-examples/registration-1.json';

        this._http.get(
            testDataReq,
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
            'selectCity': Observable.of(CITYES),
            'country': Observable.of(STATES)
        };

        this.setConfigurationSubscription();
        this.setValuesSubscription();
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

    handleValidityChange(event) {
        this.isValid = event;
    }

    private setValuesSubscription() {
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

    private setConfigurationSubscription() {
        this._store.select((state) => {
            if (state && state.simpleFormReducer && state.simpleFormReducer[this.formSlot] && state.simpleFormReducer[this.formSlot]["configuration"]) {
                return state.simpleFormReducer[this.formSlot]["configuration"];
            }
            return null;
        }).filter(v => !!v)
            .subscribe(v => {
                this.config = v;
            });
    }
}