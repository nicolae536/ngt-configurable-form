import { Component, Input, ViewEncapsulation, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { IElementConfig } from '../configuratble-form/configurable-form.interfaces';
import { MAT_INPUT_ELEMENTS } from './form-elements.consts';

@Component({
    selector: 'ngt-form-elements',
    templateUrl: './form-elements.html',
    styleUrls: ['./form-elements.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementsComponent {
    @HostBinding('class.ngt-component') isNgtComponent = true;
    @Input() formName: boolean;
    @Input() parentFormGroup: FormGroup;
    @Input() elements: IElementConfig[];

    matInputContainerElements = MAT_INPUT_ELEMENTS;

    constructor() {
    }

    getErrorMessage(errorField: FormControl) {
        console.info(errorField);
        return '';
    }
}
