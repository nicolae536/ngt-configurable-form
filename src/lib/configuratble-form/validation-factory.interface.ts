import { FormGroup } from '@angular/forms';
import { IValidationResult } from './base-validators';
import { FormGroupValidatorMetadata, IElementConfig } from './configurable-form.interfaces';

export type IValidatorFunction = (ngFormControl: FormGroup, elementConfig: IElementConfig, value: any, staticMetadata: any) => IValidationResult;

export interface IValidationFactory {
    hasValidator(validator: FormGroupValidatorMetadata): boolean;

    getValidator(validator: FormGroupValidatorMetadata): IValidatorFunction;
}
