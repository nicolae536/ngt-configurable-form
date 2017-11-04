import { Component, HostBinding, Input, ViewEncapsulation, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { ERROR_MESSAGES } from '../configuratble-form/configurable-form.providers';
import { MAT_INPUT_ELEMENTS } from '../form-elements/form-elements.consts';
import { IMatSelectElement, IElementConfig } from '../models/element.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';
import { UiElement } from '../models/ui-element';
import { utils } from '../models/utils';
import { elementWrapperError } from './element-wrapper.consts';
import { ErrorMessagesFactory, IMessageFunction } from '../configuratble-form/configurable-form.interfaces';

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
        if (utils.isFunction(this._errorMessages[control.name])) {
            const messageF: IMessageFunction = this._errorMessages[control.name] as IMessageFunction;
            return messageF(this.rootFormGroup, control.getControl().errors);
        }

        if (this._errorMessages[control.name]) {
            return this._errorMessages[control.name];
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
}
