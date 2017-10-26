import { FormGroup } from '@angular/forms';
import { IFormConfig, IGroupElementConfig } from '../models/groups.config.interfaces';
import { IElementConfig } from '../models/element.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';


/**
 * ======================================================
 * 1. Class types
 * ======================================================
 */
export interface IMappedFormConfig {
    formConfig: IFormConfig;
    ngFormControls: FormGroup;
    flattenConfigRef: Map<string, IElementConfig | IGroupElementConfig>;
}

export interface IFoundElementParams {
    index: number;
    element: IElementConfig;
    group: IGroupElementConfig;
    lineIndex: number;
    parentElementArray: IElementConfig[] | IGroupElementConfig[];
}

export interface IElementChangePayload {
    element: Dictionary<any>;
    groupName?: string;
    afterElement?: string;
}
