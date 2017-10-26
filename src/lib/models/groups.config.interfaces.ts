
import { ISharedProps, IConfigurationChangeDescription } from './shared.interfaces';
import { IElementConfig } from './element.config.interfaces';
/**
 * ======================================================
 * 1. JSON Form and group types
 * ======================================================
 */
export interface IFormConfig {
    name: string; // unique identifier
    groupElements: IGroupElementConfig[];
    addCardClass: boolean;
    linkDefinitions?: IConfigurationChangeDescription[];
}

export interface IGroupElementConfig extends ISharedProps {
    elements: IGroupInnerElementsConfig[];
    wrapInExpansionPane?: boolean;
    addCardClass?: boolean;
    title?: string;
    description?: string;
    isPanelOpened?: boolean;
    flatValueInForm: boolean;
}

export interface IGroupInnerElementsConfig {
    elementsOnLine: IElementConfig[];
}
