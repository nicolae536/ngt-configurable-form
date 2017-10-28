import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { Dictionary, FormGroupValidatorMetadata } from './shared.interfaces';
import { utils } from './utils';

export abstract class BaseModel<T> {
    required: boolean;
    validation: FormGroupValidatorMetadata[];
    _original: Dictionary<string>;
    _lastCompiled: Dictionary<string>;
    _wasTouched: boolean;
    _attachedNgControl: T;

    constructor(value: Dictionary<any>) {
        this._original = utils.cloneDeep<Dictionary<string>>(value);
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
        return utils.areEqual(this, element, ['_original', '_lastCompiled', '_wasTouched', 'validation']);
    }

    setRequired(validation: FormGroupValidatorMetadata[]) {
        if (!utils.isArray(validation)) {
            this.required = true;
        }

        this.required = !!validation.find((prop) => prop && prop.type === 'required');
    }
}
