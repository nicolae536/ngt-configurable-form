// ngt-form-reducer

import { Action } from '@ngrx/store';
import { utils } from '../../lib/models/utils';

export interface IAction extends Action {
    payload: any;
}

export interface ISimplePayload {
    formName: string;
    configuration?: any;
    value?: any;
    validity: any;
}

export function simpleFormReducer(state: any, action: IAction) {
    if (!state) {
        state = {};
    }

    switch (action.type) {
        case 'CONFIGURATION_CHANGE':
            return updateStoreConfiguration(state, action.payload);
        case 'VALUE_CHANGE':
            return updateStoreValueChange(state, action.payload);
        case 'VALIDITY_CHANGE':
            return updateStoreValidityChange(state, action.payload);
        case 'SET_EXPANDED_PANES':
            return updateExpandedPanes(state, action.payload);
        case 'SET_TOUCHED_ELEMENTS':
            return updateTouchedElements(state, action.payload);
    }

    return state;
}

export function updateStoreConfiguration(state: any, payload: ISimplePayload) {
    state[payload.formName] = {
        expandedPanes: {},
        value: {},
        touchedElements: {},
        configuration: utils.cloneDeep(payload.configuration)
    };
    return {...state};
}

export function updateStoreValueChange(state: any, payload: ISimplePayload) {
    state[payload.formName] = utils.cloneDeep(state[payload.formName]);
    state[payload.formName].value = utils.cloneDeep(payload.value);
    return {...state};
}

export function updateStoreValidityChange(state: any, payload: ISimplePayload) {
    state[payload.formName] = utils.cloneDeep(state[payload.formName]);
    state[payload.formName].validity = utils.cloneDeep(payload.validity);
    return {...state};
}

function updateExpandedPanes(state: any, payload: any) {
    state[payload.formName] = utils.cloneDeep(state[payload.formName]);
    state[payload.formName].expandedPanes = JSON.parse(JSON.stringify(payload.expandedPanes));
    return {...state};
}

function updateTouchedElements(state: any, payload: any) {
    state[payload.formName] = utils.cloneDeep(state[payload.formName]);
    state[payload.formName].touchedElements = JSON.parse(JSON.stringify(payload.touchedElements));
    return {...state};

}
