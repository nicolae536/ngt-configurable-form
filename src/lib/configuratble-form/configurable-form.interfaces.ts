/**
 * ======================================================
 * 1. JSON types
 * ======================================================
 */
import { FormGroup } from '@angular/forms';

export interface IFormConfig {
    name: string; // unique identifier
    groupElements: IGroupElementsConfig[];
    addCardClass: boolean;
}

export interface Dictionary<T> {
    [index: string]: T;
}

export interface IGroupElementsConfig {
    classMap: Dictionary<boolean>;
    elements: IGroupElementConfig[];
    name: string;
    wrapInExpansionPane?: boolean;
    addCardClass?: boolean;
    title?: string;
    description: string;
    isPanelOpened: boolean;
}

export interface IGroupElementConfig {
    elementsOnLine: IElementConfig[];
}

export interface IElementConfig extends IElementBase, IMatInputElement, IMatRadioElement, IMatSelectElement, IMatDatePicker {
    isDefaultConfig?: boolean;
}

export interface IChangeConfig {
    expectedValue: any;
    linkedElement: string;
    configurationChange: IElementConfig;
}

export interface IElementCustomConfig {
    defaultConfig: IElementConfig;
    configurationChange: IChangeConfig[];
}

export interface IElementBase {
    name: string; // unique name
    required: boolean;
    class: string;
    type: string;
    placeholder: string;
    showTooltip?: boolean;
    size: number;
    configurationChangeMap: IElementCustomConfig;
    hidden: boolean;
    disabled: boolean;
    validation: FormGroupValidatorMetadata[];
    updateFields: Dictionary<string>;
    value: any;
}

export interface FormGroupValidatorMetadata {
    type: string;
    staticMetadata?: any;
    ranking?: number;
    fieldsMap?: any;
    errorField?: string;
}

interface IPrefixSuffixConfig {
    renderAs: 'string' | 'html' | 'icon';
    text: string;
}

export interface IMatInputElement {
    hint: string;
    alignHint: string;
    prefix: IPrefixSuffixConfig;
    suffix: IPrefixSuffixConfig;
}

export interface IMatRadioButtonElement {
    value: any;
    checked: boolean;
}

export interface IMatRadioElement {
    radioElements: IMatRadioButtonElement;
}

export interface IMatSelectElement {
    selectConfig: {
        valueField: string;
        visibleProps: string[];
        optionClassMap?: Dictionary<string>;
        updateProperties?: Dictionary<string>;
    };
}

export interface IMatDatePicker {
    dateConfig: {
        startView: 'month' | 'year';
        useTogglePrefix: boolean;
        useToggleSuffix: boolean;
    };
}

/**
 * ======================================================
 * 1. Class types
 * ======================================================
 */
export interface IMappedFormConfig {
    formConfig: IFormConfig;
    ngFormControls: FormGroup;
    flattenConfigRef: Map<string, IElementConfig>;
}

export interface IFoundElementParams {
    index: number;
    element: IElementConfig;
    group: IGroupElementsConfig;
    lineIndex: number;
    parentElementArray: IElementConfig[] | IGroupElementsConfig[];
}

export interface IElementChangePayload {
    element: IElementConfig;
    groupName?: string;
    afterElement?: string;
}
