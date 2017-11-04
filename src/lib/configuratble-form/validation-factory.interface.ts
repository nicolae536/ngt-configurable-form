import { FormGroup } from '@angular/forms';
import { IValidationResult } from './base-validators';
import { IElementConfig } from '../models/element.config.interfaces';
import { FormGroupValidatorMetadata } from '../models/shared.interfaces';

export type IValidatorFunction = (ngFormControl: FormGroup,
                                  elementConfig: IElementConfig,
                                  value: any,
                                  staticMetadata: any) => IValidationResult;

export interface IValidationFactory {
    hasValidator(validator: FormGroupValidatorMetadata): boolean;

    getValidator(validator: FormGroupValidatorMetadata): IValidatorFunction;
}
