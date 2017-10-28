import { FormControl, AbstractControl } from '@angular/forms';
import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { Dictionary, FormGroupValidatorMetadata } from './shared.interfaces';
import { utils } from './utils';

export abstract class BaseModel<T> {
    required: boolean;
    validation: FormGroupValidatorMetadata[];
    private _innerModel: {
        original?: Dictionary<string>,
        touched?: boolean;
        ngControl?: AbstractControl
    } = {};

    private _ngMarkAsTouched: (opts?: { onlySelf?: boolean }) => void;
    private _ngMarkAsUnTouched: (opts?: { onlySelf?: boolean }) => void;

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
        return utils.areEqual(this, element, ['_innerModel', 'validation']);
    }

    setRequired(validation: FormGroupValidatorMetadata[]) {
        if (!utils.isArray(validation)) {
            this.required = true;
        }

        this.required = !!validation.find((prop) => prop && prop.type === 'required');
    }

    attachControl(ngControl: AbstractControl) {
        if (!ngControl) {
            return;
        }
        const oldControlValue = this._innerModel.ngControl.value;
        ngControl.setValue(oldControlValue, {onlySelf: true, emitEvent: false});
        this.removeOldTouchedHooks();
        this._innerModel.ngControl = ngControl;
        this.setTouchedHooks();

        if (this._innerModel.touched) {
            this._innerModel.ngControl.markAsTouched({onlySelf: true});
        }
    }

    hasNgControl(): boolean {
        return !!(this._innerModel && this._innerModel.ngControl);
    }

    private setTouchedHooks() {
        this._ngMarkAsTouched = this._innerModel.ngControl.markAsTouched.bind(this._innerModel.ngControl);
        this._ngMarkAsUnTouched = this._innerModel.ngControl.markAsUntouched.bind(this._innerModel.ngControl);

        this._innerModel.ngControl.markAsTouched = (opts?: {
            onlySelf?: boolean;
        }) => {
            this._ngMarkAsTouched(opts);
            this._innerModel.touched = this._innerModel.ngControl.touched;
        };

        this._innerModel.ngControl.markAsUntouched = (opts?: {
            onlySelf?: boolean;
        }) => {
            this._ngMarkAsUnTouched(opts);
            this._innerModel.touched = this._innerModel.ngControl.touched;
        };
    }

    private removeOldTouchedHooks() {
        this._innerModel.ngControl.markAsTouched = this._ngMarkAsTouched.bind(this._innerModel.ngControl);
        this._innerModel.ngControl.markAsUntouched = this._ngMarkAsUnTouched.bind(this._innerModel.ngControl);
    }
}
