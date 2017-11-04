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
    expandedPanes: any;
    dataProviders: Dictionary<Observable<any>>;
    touchedControls: any;
    private formSlot: string = 'ngtReduxForm';
    private urlToFormConfig = '/assets/first-form.config.json';

    constructor(http: Http, private _store: Store<any>) {
        super(http);
        this.setConfigurationSubscription();
        this.setValuesSubscription();
        this.setExpandedPanesSubscription();
        this.setTouchedMapSubscription();
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

    handleExpandedPanesChange(event) {
        this._store.dispatch({
            type: 'SET_EXPANDED_PANES',
            payload: {
                'formName': this.formSlot,
                'expandedPanes': event
            }
        });
    }

    handleValidityChange(event) {
        this.isValid = event;
    }

    handleTouchedChange(event) {
        this._store.dispatch({
            type: 'SET_TOUCHED_ELEMENTS',
            payload: {
                'formName': this.formSlot,
                'touchedElements': event
            }
        });
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
                state.simpleFormReducer[this.formSlot]['expandedPanes']) {
                return state.simpleFormReducer[this.formSlot]['expandedPanes'];
            }
            return null;
        }).filter(v => !!v)
            .subscribe(v => {
                this.expandedPanes = v;
            });
    }

    private isFormInState(state) {
        return state &&
            state.simpleFormReducer &&
            state.simpleFormReducer[this.formSlot];
    }

    private setExpandedPanesSubscription() {
        this._store.select((state) => {
            if (this.isFormInState(state) &&
                state.simpleFormReducer[this.formSlot]['configuration']) {
                return state.simpleFormReducer[this.formSlot]['configuration'];
            }
            return null;
        }).filter(v => !!v)
            .first()
            .subscribe(v => {
                this.config = v;
            });
    }

    private setTouchedMapSubscription() {
        this._store.select((state) => {
            if (this.isFormInState(state) &&
                state.simpleFormReducer[this.formSlot]['touchedElements']) {
                return state.simpleFormReducer[this.formSlot]['touchedElements'];
            }
            return null;
        }).filter(v => !!v)
            .first()
            .subscribe(v => {
                this.touchedControls = v;
            });
    }
}
