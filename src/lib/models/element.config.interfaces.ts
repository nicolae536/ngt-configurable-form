import { ISharedProps, Dictionary } from './shared.interfaces';
/**
 * ======================================================
 * 1. JSON element types
 * ======================================================
 */
export interface IElementConfig extends IElementBase, IMatInputElement, IMatRadioElement, IMatSelectElement, IMatDatePicker {
}

export interface IElementBase extends ISharedProps {
    required: boolean;
    placeholder: string;
    showTooltip?: boolean;
    size: number;
    updateFields: Dictionary<string>;
    value: any;
}
export interface IPrefixSuffixConfig {
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

export interface ISelectConfig {
    valueField: string;
    visibleProps: string[];
    optionClassMap?: Dictionary<string>;
    optionsList: any[];
    updateProperties?: Dictionary<string>;
}

export interface IMatSelectElement {
    selectConfig: ISelectConfig;
}

export interface IDatepickerConfig {
    startView: 'month' | 'year';
    useTogglePrefix: boolean;
    useToggleSuffix: boolean;
}

export interface IMatDatePicker {
    dateConfig: IDatepickerConfig;
}
