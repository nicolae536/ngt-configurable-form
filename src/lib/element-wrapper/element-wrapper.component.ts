import { Component, HostBinding, Input, ViewEncapsulation, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ErrorMessagesFactory, IMessageFunction } from '../configuratble-form/configurable-form.interfaces';
import { ERROR_MESSAGES } from '../configuratble-form/configurable-form.providers';
import { MAT_INPUT_ELEMENTS } from '../form-elements/form-elements.consts';
import { IMatSelectElement, IElementConfig } from '../models/element.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';
import { UiElement } from '../models/ui-element';
import { utils } from '../models/utils';
import { elementWrapperError } from './element-wrapper.consts';

@Component({
    selector: 'ngt-element-wrapper',
    templateUrl: 'element-wrapper.html',
    styleUrls: ['./element-wrapper.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementWrapperComponent {
    @HostBinding('class.ngt-component') isNgtComponent = true;
    @Input() formName: string;
    @Input() rootFormGroup: FormGroup;
    @Input() parentFormGroup: FormGroup;
    @Input() elementDataProvider: Observable<any>;
    @Input() currentElement: IElementConfig;
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;

    matInputContainerElements = MAT_INPUT_ELEMENTS;

    constructor(@Inject(ERROR_MESSAGES) private _errorMessages: ErrorMessagesFactory) {
    }

    handleErrorMessage(control: UiElement) {
        const maxPriorityError = this.getMaxPriorityError(control.getControl().errors);

        if (utils.isFunction(this._errorMessages[maxPriorityError.key])) {
            const messageF: IMessageFunction = this._errorMessages[maxPriorityError.key] as IMessageFunction;
            return messageF(this.rootFormGroup, maxPriorityError.error);
        }

        if (this._errorMessages[maxPriorityError.key]) {
            return this._errorMessages[maxPriorityError.key];
        }

        return control.getControl().errors ? JSON.stringify(control.getControl().errors) : '';
    }

    handleSelectConfig(selectElement: IMatSelectElement) {
        elementWrapperError.throwIfConfigInvalid(selectElement, this.elementDataProvider);
        return true;
    }

    handlePropagateValue(option: Object, updateFields: Dictionary<string>) {
        if (!updateFields || !option || !(option instanceof Object)) {
            return;
        }

        for (const key in updateFields) {
            if (this.parentFormGroup.get(updateFields[key]) &&
                option.hasOwnProperty(key)) {
                this.parentFormGroup.get(updateFields[key]).patchValue(option[key]);
            }
        }
    }

    private getMaxPriorityError(errors: ValidationErrors | any): {
        error: ValidationErrors,
        key: string
    } {
        if (!errors) {
            return null;
        }

        let errorToReturn = {ranking: -1};
        let keyToReturn = null;
        for (const key in errors) {
            if (!errors[key]) {
                continue;
            }

            if (!errors[key].hasOwnProperty('ranking')) {
                return {
                    key: key,
                    error: errors[key]
                };
            }

            if (errors[key].ranking > errorToReturn.ranking) {
                errorToReturn = errors[key];
                keyToReturn = key;
            }
        }

        return {
            key: keyToReturn,
            error: errorToReturn
        };
    }
}
