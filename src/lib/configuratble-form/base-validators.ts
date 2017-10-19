import { FormGroup, ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { FormGroupValidatorMetadata, IElementConfig } from './configurable-form.interfaces';

/* Interface for error map */
export interface IValidationResult {
    [key: string]: any;
}

type IValidationFunction = (ngFormGroup: FormGroup,
                            element: IElementConfig,
                            controlValue: any,
                            validator: FormGroupValidatorMetadata) => { [key: string]: any };

const EMAIL_VALIDATION_REGEXP =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const REQUIRED_ERROR = {'required': true};
export const INVALID_DATE_ERROR: string = 'Invalid Date';

export class BaseValidators {

    static getAngularValidator(ngFormControl: FormGroup,
                               elementConfig: IElementConfig,
                               fn: (ngFormControl: FormGroup, elementConfig, value, metadata?) => IValidationResult,
                               validator: FormGroupValidatorMetadata,
                               isAngularValidator: boolean = false): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (isAngularValidator) {
                let ngFn: ValidatorFn = fn as ValidatorFn;
                ngFn = validator && validator.staticMetadata ? (ngFn(validator.staticMetadata)) as ValidatorFn : ngFn;
                const functionResult = ngFn(control);
                if (functionResult && validator.ranking) {
                    functionResult['ranking'] = validator.ranking;
                }

                return functionResult;
            }

            const functionResult = fn(ngFormControl, elementConfig, control.value, validator);
            if (functionResult && validator.ranking) {
                functionResult['ranking'] = validator.ranking;
            }
            return functionResult;
        };
    }

    static required(ngFormGroup: FormGroup, element: IElementConfig, controlValue: any, validator: FormGroupValidatorMetadata) {
        const isString = typeof(controlValue) === 'string';

        if (isString) {
            controlValue = controlValue.trim();
        }

        if (controlValue === '') {
            return REQUIRED_ERROR;
        }

        if (Array.isArray(controlValue) && controlValue.length === 0) {
            return REQUIRED_ERROR;
        }

        if (!isString &&
            controlValue instanceof Object &&
            !(controlValue instanceof Date) &&
            Object.keys(controlValue).length === 0) {
            return REQUIRED_ERROR;
        }

        return Validators.required(ngFormGroup.get(element.name));
    }

    /**
     * Email validator.
     * @return {string} Error map.
     * @return {null} Validation has passed.
     */
    static email(ngFormGroup: FormGroup,
                 element: IElementConfig,
                 controlValue: any,
                 validator: FormGroupValidatorMetadata): IValidationResult {
        controlValue = '' + controlValue;
        if (controlValue !== '' && !controlValue.match(EMAIL_VALIDATION_REGEXP)) {
            return {'invalidEmailAddress': true};
        }

        return null;
    }

    /**
     * Integer validation
     * @return {(control: AbstractControl): { [key: string]: any }} Validation function;
     */
    static integer(ngFormGroup: FormGroup,
                   element: IElementConfig,
                   controlValue: any,
                   validator: FormGroupValidatorMetadata): IValidationResult {
        if (BaseValidators.number(ngFormGroup, element, controlValue, validator) !== null) {
            return {
                'integer': true
            };
        }

        const zeroDecimalCount = BaseValidators.maxDecimalLength(ngFormGroup, element, controlValue, {type: '', staticMetadata: 0});
        if (zeroDecimalCount(ngFormGroup, element, controlValue, validator) !== null) {
            return {
                'integer': true
            };

        }

        return null;
    }

    /**
     * Number validator.
     * @return {string} Error map.
     * @return {null} Validation has passed.
     */
    static number(ngFormGroup: FormGroup,
                  element: IElementConfig,
                  controlValue: any,
                  validator: FormGroupValidatorMetadata): IValidationResult {
        const valueAsString = '' + (controlValue);
        if (controlValue && valueAsString !== '' &&
            (isNaN(controlValue) ||
                valueAsString[0] === '.' ||
                valueAsString[valueAsString.length - 1] === '.'
            )) {
            return {'invalidNumber': true};
        }

        if (controlValue && valueAsString !== '') {
            const indexOfDash = valueAsString.indexOf('-');
            const numberOfDashes = (valueAsString.match(/-/g) || []).length;
            const numberOfZerosAfterDash = (valueAsString.match(/-0[0]*/g) || []).length;
            const hasZeroAfterDash = numberOfZerosAfterDash > 0 && !(numberOfZerosAfterDash === 1 && valueAsString[2] === '.');
            if ((indexOfDash !== 0 && indexOfDash !== -1) ||
                numberOfDashes > 1 ||
                hasZeroAfterDash ||
                valueAsString.indexOf('.-') !== -1 ||
                valueAsString.indexOf('-.') !== -1) {
                return {'invalidNumber': true};
            }
        }

        return null;
    }

    /**
     * Decimal Validator
     * @return {(control: AbstractControl): { [key: string]: any }} Validation function;
     */
    static maxDecimalLength(ngFormGroup: FormGroup,
                            element: IElementConfig,
                            controlValue: any,
                            validator: FormGroupValidatorMetadata): IValidationFunction {
        return (formGroup: FormGroup,
                elementRef: IElementConfig,
                value: any,
                validatorMeta: FormGroupValidatorMetadata): IValidationResult => {
            const valueAsString = '' + (value);
            if (!value || valueAsString === '') {
                return null;
            }

            const decimalCount = validator.staticMetadata;
            if (+decimalCount === 0 && valueAsString.indexOf('.') !== -1) {
                return {'maxDecimalLength': decimalCount};
            }

            const decimalStringValue = valueAsString.replace(new RegExp(/^([0-9]*.)/), '');
            return decimalStringValue !== '0' && decimalStringValue.length > decimalCount ? {'maxDecimalLength': decimalCount} : null;
        };
    }


    /**
     * Password validator.
     * @return {string} Error map.
     * @return {null} Validation has passed.
     */
    static password(ngFormGroup: FormGroup,
                    element: IElementConfig,
                    controlValue: any,
                    validator: FormGroupValidatorMetadata): IValidationResult {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (!controlValue.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            return {'invalidPassword': true};
        }

        return null;
    }

    static date(ngFormGroup: FormGroup,
                element: IElementConfig,
                controlValue: any,
                validator: FormGroupValidatorMetadata): IValidationResult {
        return BaseValidators.isMdDateInvalid(controlValue);
    }

    static minDate(ngFormGroup: FormGroup,
                   element: IElementConfig,
                   controlValue: any,
                   validator: FormGroupValidatorMetadata): IValidationResult {
        let minDateValue = null;
        let minDateControl: AbstractControl = null;

        if (ngFormGroup && ngFormGroup.get(validator.staticMetadata)) {
            minDateControl = ngFormGroup.get(validator.staticMetadata);
            minDateValue = ngFormGroup.get(validator.staticMetadata).value;
        }

        const isNotValid = BaseValidators.isMdDateInvalid(controlValue);
        if (isNotValid) {
            return isNotValid;
        }

        if (minDateValue &&
            controlValue &&
            minDateValue.getTime() &&
            controlValue.getTime() &&
            minDateValue.getTime() > controlValue.getTime()) {
            return {'minDate': minDateValue};
        }

        if (minDateControl && minDateControl.errors && minDateControl.errors.maxDate) {
            minDateControl.setErrors(null);
        }
    }

    static maxDate(ngFormGroup: FormGroup,
                   element: IElementConfig,
                   controlValue: any,
                   validator: FormGroupValidatorMetadata): IValidationResult {
        let maxDateValue = null;
        let maxDateControl: AbstractControl = null;

        if (ngFormGroup && ngFormGroup.get(validator.staticMetadata)) {
            maxDateControl = ngFormGroup.get(validator.staticMetadata);
            maxDateValue = ngFormGroup.get(validator.staticMetadata).value;
        }

        const isNotValid = BaseValidators.isMdDateInvalid(controlValue);
        if (isNotValid) {
            return isNotValid;
        }

        if (maxDateValue &&
            controlValue &&
            maxDateValue.getTime() &&
            controlValue.getTime() &&
            maxDateValue.getTime() < controlValue.getTime()) {
            return {'maxDate': maxDateValue};
        }

        if (maxDateControl && maxDateControl.errors && maxDateControl.errors.minDate) {
            maxDateControl.setErrors(null);
        }
    }

    static minValue(ngFormGroup: FormGroup,
                    element: IElementConfig,
                    controlValue: any,
                    validator: FormGroupValidatorMetadata): IValidationResult {
        if (controlValue === '') {
            return null;
        }
        const value = validator.staticMetadata;

        return +controlValue < +value ? {'minValue': {'minValue': value, 'actualvalue': controlValue}} : null;
    }

    static maxValue(ngFormGroup: FormGroup,
                    element: IElementConfig,
                    controlValue: any,
                    validator: FormGroupValidatorMetadata): IValidationResult {
        const value = validator.staticMetadata;
        return +controlValue > +value ? {'maxValue': {'maxValue': value, 'actualvalue': controlValue}} : null;
    }

    static maxTime(ngFormGroup: FormGroup,
                   element: IElementConfig,
                   controlValue: any,
                   validator: FormGroupValidatorMetadata): IValidationResult {
        let splittedTime = validator.staticMetadata ? validator.staticMetadata.split(':') : [23, 59];
        let hours = +splittedTime[0] * 3600;
        let minutes = +splittedTime[1] * 60;

        const maxTimeValue = hours + minutes;

        if (!controlValue) {
            return null;
        }

        splittedTime = controlValue.split(':');
        hours = splittedTime[0] ? +splittedTime[0] * 3600 : 0;
        minutes = splittedTime[1] ? +splittedTime[1] * 60 : 0;

        return +(hours + minutes) > +maxTimeValue
            ? {'maxTime': {'maxTime': validator.staticMetadata, 'actualvalue': controlValue}}
            : null;

    }

    static minTime(ngFormGroup: FormGroup, element, controlValue: any, value: any): IValidationResult {
        if (!controlValue) {
            return null;
        }

        let splittedTime = value ? value.split(':') : [0, 0];
        let hours = +splittedTime[0] * 3600;
        let minutes = +splittedTime[1] * 60;

        const maxTimeValue = hours + minutes;

        splittedTime = controlValue.split(':');
        hours = +splittedTime[0] * 3600;
        minutes = +splittedTime[1] * 60;

        return +(hours + minutes ) < +maxTimeValue
            ? {'minTime': {'minTime': value, 'actualvalue': controlValue}}
            : null;
    }

    static isMdDateInvalid(value: Date): IValidationResult {
        if (value === null || (value && value.toString() === INVALID_DATE_ERROR)) {
            return {'dateValidator': true};
        }
    }
}
