import { Component, HostBinding, Input, ViewEncapsulation, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { IElementChangePayload } from '../configuratble-form/configurable-form.interfaces';
import { MAT_INPUT_ELEMENTS } from '../form-elements/form-elements.consts';
import { elementWrapperError } from './element-wrapper.consts';
import { IMatSelectElement, IElementConfig } from '../models/element.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';

@Component({
    selector: 'ngt-element-wrapper',
    templateUrl: 'element-wrapper.html',
    styleUrls: ['./element-wrapper.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ElementWrapperComponent {
    @HostBinding('class.ngt-component') isNgtComponent = true;
    @Input() formName: boolean;
    @Input() parentFormGroup: FormGroup;
    @Input() elementDataProvider: Observable<any>;
    @Input() currentElement: IElementConfig;
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;

    matInputContainerElements = MAT_INPUT_ELEMENTS;

    constructor() {
    }

    getErrorMessage(errorField: AbstractControl) {
        return errorField && errorField.errors ? JSON.stringify(errorField.errors) : '';
    }

    isSelectConfigurationValid(selectElement: IMatSelectElement) {
        elementWrapperError.throwIfConfigInvalid(selectElement, this.elementDataProvider);
        return true;
    }

    handleConfigurationChange(change: IElementChangePayload) {

    }

    patchElementsValues(option: Object, updateFields: Dictionary<string>) {
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
