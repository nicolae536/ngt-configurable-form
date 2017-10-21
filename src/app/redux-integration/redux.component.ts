import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Dictionary } from '../../lib/configuratble-form/configurable-form.interfaces';
import { CITYES, STATES } from '../mock-data.providers';

@Component({
    selector: 'ngt-redux-form',
    templateUrl: './redux-form.html',
    encapsulation: ViewEncapsulation.None
})
export class ReduxFormComponent {
    config: any;
    currentValue$: any;
    isValid: any;
    dataProviders: Dictionary<Observable<any>>;
    private formSlot: string = 'ngtReduxForm';
    private urlToFormConfig = '/assets/layout-examples/registration-1.json';

    constructor(private _http: Http, private _store: Store<any>) {
        this._http.get(
            this.urlToFormConfig,
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json())
            .subscribe(value => {
                this._store.dispatch({
                    type: 'CONFIGURATION_CHANGE',
                    payload: {
                        'formName': this.formSlot,
                        'configuration': value
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
            type: 'CONFIGURATION_CHANGE',
            payload: {
                'formName': this.formSlot,
                'configuration': event
            }
        });
    }

    handleValueChange(event) {
        this._store.dispatch({
            type: 'VALUE_CHANGE',
            payload: {
                'formName': this.formSlot,
                'value': event
            }
        });
    }

    handleValidityChange(event) {
        this.isValid = event;
    }

    private setValuesSubscription() {
        this._store.select((state) => {
            if (this.isFormInState(state) &&
                state.simpleFormReducer[this.formSlot]['value']) {
                return state.simpleFormReducer[this.formSlot]['value'];
            }
            return null;
        }).filter(v => !!v)
            .subscribe(v => {
                this.currentValue$ = v;
            });
    }

    private setConfigurationSubscription() {
        this._store.select((state) => {
            if (this.isFormInState(state) &&
                state.simpleFormReducer[this.formSlot]['configuration']) {
                return state.simpleFormReducer[this.formSlot]['configuration'];
            }
            return null;
        }).filter(v => !!v)
            .subscribe(v => {
                this.config = v;
            });
    }

    private isFormInState(state) {
        return state &&
            state.simpleFormReducer &&
            state.simpleFormReducer[this.formSlot];
    }
}
