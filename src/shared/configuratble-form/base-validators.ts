import { FormGroup, ValidatorFn, AbstractControl, Validators } from '@angular/forms';
import { FormGroupValidatorMetadata } from './configurable-form.interfaces';

/* Interface for error map */
interface IValidationResult {
    [key: string]: any;
}

const DATE_VALIDATION_REGEXP = /^[1-9]\d{3}((\-\d{1,2})|(\d{1,2}))((\-\d{1,2})|(\d{0,1,2}))/;
const EMAIL_VALIDATION_REGEXP =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const REQUIRED_ERROR = {'required': true};
export const INVALID_DATE_ERROR: string = 'Invalid Date';

export class BaseValidators {

    static getAngularValidator(ngFormControl: FormGroup,
                               elementConfig,
                               fn: (ngFormControl: FormGroup, elementConfig, value, metadata?) => IValidationResult,
                               validator: FormGroupValidatorMetadata,
                               isAngularValidator: boolean = false): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            if (isAngularValidator) {
                let ngFn: ValidatorFn = fn as ValidatorFn;
                ngFn = validator ? (ngFn(validator.staticMetadata)) as ValidatorFn : ngFn;
                return ngFn(control);
            }

            return fn(ngFormControl, elementConfig, control.value, validator.staticMetadata);
        };
    }

    static required(ngFormGroup: FormGroup, element, controlValue) {
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
    static email(ngFormGroup: FormGroup, elementConfig, currentValue: any): IValidationResult {
        currentValue = '' + currentValue;
        if (currentValue !== '' && !currentValue.match(EMAIL_VALIDATION_REGEXP)) {
            return {'invalidEmailAddress': true};
        }

        return null;
    }

    /**
     * Integer validation
     * @return {(control: AbstractControl): { [key: string]: any }} Validation function;
     */
    static integer(ngFormGroup: FormGroup, elementConfig, controlValue: any): IValidationResult {
        if (BaseValidators.number(ngFormGroup, elementConfig, controlValue) !== null) {
            return {
                'integer': true
            };
        }

        const zeroDecimalCount = BaseValidators.maxDecimalLength(0);
        if (zeroDecimalCount(ngFormGroup, elementConfig, controlValue) !== null) {
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
    static number(ngFormGroup: FormGroup, elementConfig, currentValue: any): IValidationResult {
        const valueAsString = '' + (currentValue);
        if (currentValue && valueAsString !== '' &&
            (isNaN(currentValue) ||
                valueAsString[0] === '.' ||
                valueAsString[valueAsString.length - 1] === '.'
            )) {
            return {'invalidNumber': true};
        }

        if (currentValue && valueAsString !== '') {
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
    static maxDecimalLength(decimalCount: number) {
        return (ngFormGroup: FormGroup, elementConfig, controlValue: any): { [key: string]: any } => {
            const valueAsString = '' + (controlValue);
            if (!controlValue || valueAsString === '') {
                return null;
            }

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
    static password(ngFormGroup: FormGroup, elementConfig, controlValue): IValidationResult {
        // {6,100}           - Assert password is between 6 and 100 characters
        // (?=.*[0-9])       - Assert a string has at least one number
        if (!controlValue.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
            return {'invalidPassword': true};
        }

        return null;
    }

    static date(ngFormGroup: FormGroup, element, controlValue, metadata: string): IValidationResult {
        return BaseValidators.isMdDateInvalid(controlValue);
    }

    static minDate(ngFormGroup: FormGroup, element, controlValue, minControlName: string): IValidationResult {
        let minDateValue = null;
        let minDateControl: AbstractControl = null;

        if (ngFormGroup && ngFormGroup.get(minControlName)) {
            minDateControl = ngFormGroup.get(minControlName);
            minDateValue = ngFormGroup.get(minControlName).value;
        }

        const isNotValid = BaseValidators.isMdDateInvalid(controlValue);
        if (isNotValid) {
            return isNotValid;
        }

        if (minDateValue &&
            controlValue &&
            minDateValue.getTime() > controlValue.getTime()) {
            return {'minDate': minDateValue};
        }

        if (minDateControl && minDateControl.errors && minDateControl.errors.maxDate) {
            minDateControl.setErrors(null);
        }
    }

    static maxDate(ngFormGroup: FormGroup, element, controlValue: any, maxControlName: string): IValidationResult {
        let maxDateValue = null;
        let maxDateControl: AbstractControl = null;

        if (ngFormGroup && ngFormGroup.get(maxControlName)) {
            maxDateControl = ngFormGroup.get(maxControlName);
            maxDateValue = ngFormGroup.get(maxControlName).value;
        }

        const isNotValid = BaseValidators.isMdDateInvalid(controlValue);
        if (isNotValid) {
            return isNotValid;
        }

        if (maxDateValue &&
            controlValue &&
            maxDateValue.getTime() < controlValue.getTime()) {
            return {'maxDate': maxDateValue};
        }

        if (maxDateControl && maxDateControl.errors && maxDateControl.errors.minDate) {
            maxDateControl.setErrors(null);
        }
    }

    static minValue(ngFormGroup: FormGroup, element, controlValue: any, value: number): IValidationResult {
        if (controlValue === '') {
            return null;
        }

        return +controlValue < +value ? {'minValue': {'minValue': value, 'actualvalue': controlValue}} : null;
    }

    static maxValue(ngFormGroup: FormGroup, element, controlValue: any, value: number): IValidationResult {
        return +controlValue > +value ? {'maxValue': {'maxValue': value, 'actualvalue': controlValue}} : null;
    }

    static maxTime(ngFormGroup: FormGroup, element, controlValue: any, value: any): IValidationResult {
        let splittedTime = value ? value.split(':') : [23, 59];
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
            ? {'maxTime': {'maxTime': value, 'actualvalue': controlValue}}
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

    static isDateInvalid(value: string): IValidationResult {
        if (value === null || value === undefined) {
            return null;
        }

        if (!DATE_VALIDATION_REGEXP.test(value)) {
            return {'dateValidator': true};
        }
    }
}
