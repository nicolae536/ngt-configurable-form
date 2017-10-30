import { AbstractControl, ValidatorFn } from '@angular/forms';
import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { Dictionary, FormGroupValidatorMetadata } from './shared.interfaces';
import { utils } from './utils';

export abstract class BaseModel<T> {
    required: boolean;
    hidden: boolean;
    disabled: boolean;
    value: any;
    validation: FormGroupValidatorMetadata[];

    private _innerModel: {
        original?: Dictionary<string>,
        touched?: boolean,
        ngControl?: AbstractControl,
        attachedUiElements: any[],
        _ngMarkAsTouched?: (opts?: { onlySelf?: boolean }) => void,
        _ngMarkAsUnTouched?: (opts?: { onlySelf?: boolean }) => void,
    } = {attachedUiElements: []};

    constructor(value: Dictionary<any>) {
        this._innerModel.original = utils.cloneDeep<Dictionary<string>>(value);
        if (!value) {
            this.throwError(elementErrorMessages.notDefined);
        }

        for (const prop in value) {
            this[prop] = value[prop];
        }

        this.setRequired(this.validation);
    }

    throwError(errorMsg: string) {
        utils.throwError(errorMsg, this);
    }

    isEqual(element: Dictionary<any>): boolean {
        return utils.areEqual(this, element, ['_innerModel']);
    }

    setRequired(validation: FormGroupValidatorMetadata[]) {
        if (!utils.isArray(validation)) {
            this.required = false;
            return;
        }

        this.required = !!validation.find((prop) => prop && prop.type === 'required');
    }

    attachControl(ngControl: AbstractControl) {
        if (!ngControl) {
            return;
        }
        const oldControlValue = this._innerModel.ngControl
            ? this._innerModel.ngControl.value
            : this.value || null;
        if (oldControlValue) {
            ngControl.patchValue(oldControlValue, {onlySelf: true, emitEvent: false});
        }
        this.removeOldTouchedHooks();
        this._innerModel.ngControl = ngControl;
        this.setTouchedHooks();

        if (this._innerModel.touched) {
            this._innerModel.ngControl.markAsTouched({onlySelf: true});
        }
    }

    validateIfTouched() {
        if (this._innerModel.ngControl &&
            this._innerModel.ngControl.touched) {
            this._innerModel.ngControl.updateValueAndValidity({onlySelf: true});
        }
    }

    getControl() {
        return this._innerModel.ngControl;
    }

    setValidation(validator: ValidatorFn) {
        this._innerModel.ngControl.validator = validator;
        this._innerModel.ngControl.updateValueAndValidity({onlySelf: true, emitEvent: false});
    }

    getOriginal(): Dictionary<any> {
        return this._innerModel.original;
    }

    private setTouchedHooks() {
        this._innerModel._ngMarkAsTouched = this._innerModel.ngControl.markAsTouched.bind(this._innerModel.ngControl);
        this._innerModel._ngMarkAsUnTouched = this._innerModel.ngControl.markAsUntouched.bind(this._innerModel.ngControl);

        this._innerModel.ngControl.markAsTouched = (opts?: {
            onlySelf?: boolean;
        }) => {
            this._innerModel._ngMarkAsTouched(opts);
            this._innerModel.touched = this._innerModel.ngControl.touched;
        };

        this._innerModel.ngControl.markAsUntouched = (opts?: {
            onlySelf?: boolean;
        }) => {
            this._innerModel._ngMarkAsUnTouched(opts);
            this._innerModel.touched = this._innerModel.ngControl.touched;
        };
    }

    private removeOldTouchedHooks() {
        if (!this._innerModel.ngControl) {
            return;
        }

        if (utils.isFunction(this._innerModel._ngMarkAsTouched)) {
            this._innerModel.ngControl.markAsTouched = this._innerModel._ngMarkAsTouched.bind(this._innerModel.ngControl);
        }
        if (utils.isFunction(this._innerModel._ngMarkAsUnTouched)) {
            this._innerModel.ngControl.markAsUntouched = this._innerModel._ngMarkAsUnTouched.bind(this._innerModel.ngControl);
        }
    }
}
