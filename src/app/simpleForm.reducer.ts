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
            return storeConfiguration(state, action.payload);
        case "VALUE_CHANGE":
            return storeValueChange(state, action.payload);
        case "VALIDITY_CHANGE":
            return storeValidityChange(state, action.payload);
    }

    return state;
}

export function storeConfiguration(state: any, payload: ISimplePayload) {
    state[payload.formName] = {
        ...state[payload.formName],
        configuration: JSON.parse(JSON.stringify(payload.configuration)),
    };
    return {...state};
}

export function storeValueChange(state: any, payload: ISimplePayload) {
    state[payload.formName] = {
        ...state[payload.formName],
        value: {...payload.value}
    };
    return {...state};
}

export function storeValidityChange(state: any, payload: ISimplePayload) {
    state[payload.formName] = {
        ...state[payload.formName],
        validity: JSON.parse(JSON.stringify(payload.validity))
    };
    return {...state};
}

