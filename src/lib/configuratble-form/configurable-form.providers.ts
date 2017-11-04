import { InjectionToken } from '@angular/core';
import { Dictionary } from '../models/shared.interfaces';
import { ErrorMessagesFactory, IValidationFactory } from './configurable-form.interfaces';
import { DEFAULT_ERROR_MESSAGES } from './default-error.messages';
import { ValidationFactoryService } from './validation-factory.service';

export const VALIDATION_FACTORY = new InjectionToken<IValidationFactory>('ngt-configurable-form/validation-factory');
export const ERROR_MESSAGES = new InjectionToken<Dictionary<string | Function>>('ngt-configurable-form/error-messages-factory');

export function getValidationFactory(validationFactory: IValidationFactory) {
    return new ValidationFactoryService(validationFactory);
}

export interface IRootProviders {
    errorMessagesMap?: ErrorMessagesFactory;
    validationFactory?: () => IValidationFactory;
}

export function getRootProviders(params: IRootProviders): any[] {
    return [
        {provide: ValidationFactoryService, useFactory: getValidationFactory, deps: [VALIDATION_FACTORY]},
        {provide: VALIDATION_FACTORY, useFactory: params.validationFactory},
        {provide: ERROR_MESSAGES, useValue: {...DEFAULT_ERROR_MESSAGES, ...params.errorMessagesMap}}
    ];
}
