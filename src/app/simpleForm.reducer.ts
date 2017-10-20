import { Action } from '@ngrx/store';

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
        case "CONFIGURATION_CHANGE":
            return updateStoreConfiguration(state, action.payload);
        case "VALUE_CHANGE":
            return updateStoreValueChange(state, action.payload);
        case "VALIDITY_CHANGE":
            return updateStoreValidityChange(state, action.payload);
    }

    return state;
}

export function updateStoreConfiguration(state: any, payload: ISimplePayload) {
    state[payload.formName] = {
        ...state[payload.formName],
        configuration: JSON.parse(JSON.stringify(payload.configuration)),
    };
    return {...state};
}

export function updateStoreValueChange(state: any, payload: ISimplePayload) {
    state[payload.formName] = {
        ...state[payload.formName],
        value: {...payload.value}
    };
    return {...state};
}

export function updateStoreValidityChange(state: any, payload: ISimplePayload) {
    state[payload.formName] = {
        ...state[payload.formName],
        validity: JSON.parse(JSON.stringify(payload.validity))
    };
    return {...state};
}

