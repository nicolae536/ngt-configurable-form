import { FormGroup } from '@angular/forms';
import { IElementConfig } from '../models/element.config.interfaces';
import { IFormConfig, IGroupElementConfig } from '../models/groups.config.interfaces';
import { Dictionary, FormGroupValidatorMetadata } from '../models/shared.interfaces';
import { IValidationResult } from './base-validators';


/**
 * ======================================================
 * 1. Class types
 * ======================================================
 */
export interface IMappedFormConfig {
    formConfig: IFormConfig;
    ngFormControls: FormGroup;
    flattenConfigRef: Map<string, IElementConfig | IGroupElementConfig>;
}

export interface IFoundElementParams {
    index: number;
    element: IElementConfig;
    group: IGroupElementConfig;
    lineIndex: number;
    parentElementArray: IElementConfig[] | IGroupElementConfig[];
}

export interface IElementChangePayload {
    element: Dictionary<any>;
    groupName?: string;
    afterElement?: string;
}

export type IMessageFunction = (rootElement: FormGroup, errors: Dictionary<string>) => string;

export type ErrorMessagesFactory = Dictionary<string | IMessageFunction>;

export type IValidatorFunction = (ngFormControl: FormGroup,
                                  elementConfig: IElementConfig,
                                  value: any,
                                  staticMetadata: any) => IValidationResult;

export interface IValidationFactory {
    hasValidator(validator: FormGroupValidatorMetadata): boolean;

    getValidator(validator: FormGroupValidatorMetadata): IValidatorFunction;
}
