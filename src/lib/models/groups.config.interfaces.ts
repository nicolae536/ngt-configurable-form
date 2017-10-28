import { IElementConfig } from './element.config.interfaces';
import { ISharedProps, IConfigurationChangeDescription, Dictionary } from './shared.interfaces';

/**
 * ======================================================
 * 1. JSON Form and group types
 * ======================================================
 */
export type ILayoutModel = {
    group?: string;
    lines: string[][];
}[];

export interface IFormConfig {
    name: string; // unique identifier
    elements: IElementConfig[];
    groupElements: IGroupElementConfig[];
    layout: ILayoutModel;
    linkDefinitions?: Dictionary<IConfigurationChangeDescription>;
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
