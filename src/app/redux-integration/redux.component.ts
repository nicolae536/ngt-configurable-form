import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Dictionary } from '../../lib/models/shared.interfaces';
import { ConfigurationChangeComponent } from '../configuration-change/configuration-change';

@Component({
    selector: 'ngt-redux-form',
    templateUrl: './redux-form.html',
    encapsulation: ViewEncapsulation.None
})
export class ReduxFormComponent extends ConfigurationChangeComponent {
    config: any;
    currentValue$: any;
    isValid: any;
    dataProviders: Dictionary<Observable<any>>;
    private formSlot: string = 'ngtReduxForm';
    private urlToFormConfig = '/assets/first-form.config.json';

    constructor(http: Http, private _store: Store<any>) {
        super(http);
        this.setConfigurationSubscription();
        this.setValuesSubscription();
    }

    setupConfig() {
        this.http.get(
            '/assets/layout-examples/configuration-change.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json())
            .do(() => this.isRendered = true)
            .subscribe(value => {
                this._store.dispatch({
                    type: 'CONFIGURATION_CHANGE',
                    payload: {
                        'formName': this.formSlot,
                        'configuration': value
                    }
                });
            });
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
