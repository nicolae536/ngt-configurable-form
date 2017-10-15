import { Injectable } from '@angular/core';
import { ValidatorFn, FormGroup, Validators } from '@angular/forms';
import { BaseValidators } from './base-validators';
import { Dictionary, IElementConfig, FormGroupValidatorMetadata } from './configurable-form.interfaces';


@Injectable()
export class ValidationFactoryService {

    constructor() {
    }

    /**
     * Creating validators array for every FormControl
     * @param {boolean} required  - reuired element.
     * @param {array} validation - validation array.
     */
    getElementValidation(ngFormGroup: FormGroup, elementConfig: IElementConfig) {
        const validators = [];

        if (elementConfig.required) {
            validators.push(BaseValidators.getAngularValidator(ngFormGroup, elementConfig, BaseValidators.required, null));
        }

        if (elementConfig.validation === undefined ||
            elementConfig.validation.length === 0) {
            return validators;
        }


        elementConfig.validation.forEach((validator) => {
            const validatorFunction = this.getValidatorByType(
                ngFormGroup,
                elementConfig,
                validator
            );
            if (validatorFunction) {
                validators.push(validatorFunction);
            }
        });

        return validators;
    }

    private getValidatorByType(ngFormGroup: FormGroup, elementConfig: IElementConfig, validator: FormGroupValidatorMetadata) {
        const isBaseValidator = this.isFunction(BaseValidators[validator.type]);
        const isAngularValidator = this.isFunction(Validators[validator.type]);

        if (!isBaseValidator &&
            !isAngularValidator) {
            return () => {
                return null;
            };
        }

        if (isBaseValidator) {
            return BaseValidators.getAngularValidator(ngFormGroup, elementConfig, BaseValidators[validator.type], validator);
        }

        if (isAngularValidator) {
            return BaseValidators.getAngularValidator(ngFormGroup, elementConfig, Validators[validator.type], validator, true);
        }

        return () => null;
    }

    private isFunction(value) {
        return value instanceof Function;
    }
}

interface ISetupValidatorParams {
    ngFormGroup: FormGroup;
    formElementsFlattenConfig: Object;
    hiddenElements: string[];
    formControlsValidatorsMap: Dictionary<FormGroupValidatorMetadata>;
    initialFormControlsValidatorsMap: Dictionary<ValidatorFn>;
}
