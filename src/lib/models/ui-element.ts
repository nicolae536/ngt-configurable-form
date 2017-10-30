import { FormControl } from '@angular/forms';
import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { BaseModel } from './base-model';
import { IPrefixSuffixConfig, IMatRadioButtonElement, ISelectConfig, IDatepickerConfig } from './element.config.interfaces';
import { Dictionary } from './shared.interfaces';

export class UiElement extends BaseModel<FormControl> {
    type: string; // html | component type of the element
    name: string;
    placeholder: string;
    size: number;
    classMap?: Dictionary<any>;

    // Mat input props
    hint?: string;
    alignHint?: string;
    prefix?: IPrefixSuffixConfig;
    suffix?: IPrefixSuffixConfig;

    // Mat radio elements
    radioElements?: IMatRadioButtonElement[];

    // Mat select and autocomplete
    selectConfig?: ISelectConfig;

    // Mat datepicker config
    dateConfig: IDatepickerConfig;

    constructor(element: Dictionary<any>) {
        super(element);
        this.validateElement();
    }

    private validateElement() {
        if (!this.type) {
            this.throwError(elementErrorMessages.noType);
        }

        if (!this.name) {
            this.throwError(elementErrorMessages.noName);
        }

        switch (this.type) {
            case 'select':
            case 'autocomplete':
                this.validateSelect();
                break;
            case 'datepicker':
                this.validateDatePicker();
                break;
            case 'radiogroup':
                this.validateRadioGroup();
        }
    }

    private validateSelect() {
        if (!this.selectConfig) {
            this.throwError(elementErrorMessages.noSelectConfig);
        }

        if (!Array.isArray(this.selectConfig.visibleProps)) {
            this.throwError(elementErrorMessages.noSelectVisibleProps);
        }
    }

    private validateDatePicker() {
        if (!this.dateConfig) {
            this.throwError(elementErrorMessages.noDateConfig);
        }
    }

    private validateRadioGroup() {
        if (!Array.isArray(this.radioElements)) {
            this.throwError(elementErrorMessages.noRadioConfig);
        }

        for (const rE of this.radioElements) {
            if (!rE.hasOwnProperty('value')) {
                this.throwError(elementErrorMessages.invalidRadioElement);
            }
        }
    }
}
