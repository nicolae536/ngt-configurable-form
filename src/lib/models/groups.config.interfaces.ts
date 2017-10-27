import { IElementConfig } from './element.config.interfaces';
import { ISharedProps, IConfigurationChangeDescription } from './shared.interfaces';

/**
 * ======================================================
 * 1. JSON Form and group types
 * ======================================================
 */
export interface IFormConfig {
    name: string; // unique identifier
    elements: IElementConfig[];
    groupElements: IGroupElementConfig[];
    layout: {
        group?: string;
        lines: string[][];
    };
    linkDefinitions?: IConfigurationChangeDescription[];
}

export interface IGroupElementConfig extends ISharedProps {
    title: string;
    description: string;
    isPanelOpened?: boolean;
    flatValueInForm?: boolean;
}

export interface IGroupInnerElementsConfig {
    elementsOnLine: IElementConfig[];
}
