/**
 * ======================================================
 * 1. JSON types
 * ======================================================
 */
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { IConfigurationChange } from './configurable-form.service';

export interface IFormConfig {
    name: string; // unique identifier
    groupElements: IRowElementsConfig[];
    addCardClass: boolean;
}

export interface Dictionary<T> {
    [index: string]: T;
}

export interface IRowElementsConfig {
    class: string;
    elements: IGroupElementConfig[];
    name: string;
    wrapInExpansionPane?: boolean;
    addCardClass?: boolean;
    title?: string;
    description: string;
}

export interface IGroupElementConfig {
    elementsOnLine: IElementConfig[];
}

export interface IElementConfig extends IElementBase, IMatInputElement, IMatRadioElement, IMatSelectElement {
    isDefaultConfig?: boolean;
}

export interface IChangeConfig {
    expectedValue: any;
    linkedElement: string;
    configurationChange: IConfigurationChange;
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
    config: {
        valueField: string;
        visibleProps: string[];
        optionClassMap?: Dictionary<string>;
        updateProperties?: Dictionary<string>;
    };
}

/**
 * ======================================================
 * 1. Class types
 * ======================================================
 */
export interface IMappedFormConfig {
    formConfig: IFormConfig;
    ngFormControls: Dictionary<FormControl>;
    flattenConfigRef: Map<string, IElementConfig>;
}
