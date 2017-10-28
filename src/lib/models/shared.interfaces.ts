/**
 * ======================================================
 * Shared types
 * ======================================================
 */
export interface ISharedProps {
    name: string; // unique name
    classMap: Dictionary<boolean>;
    type: string;
    hidden: boolean;
    validation: FormGroupValidatorMetadata[];
    disabled: boolean;
}

export interface IConfigurationChangeDescription {
    // name is stored as key -> this will be a dictionary;
    // If this is present the element must be added in form
    defaultConfig?: Dictionary<any>;
    // link to other element values
    configChangesMap: IChangeConfig[];
    // TODO the layout should define the props bellow
    // mandatory field for elements which do not have a default config
    // elements without default config are removed from the form configuration
    // and pushed back when a link element decides that we should move this to the form again
    // location?: {
    //     groupName?: string;
    //     afterElement: string; // element of group name
    // };
}

export interface IChangeConfig {
    expectedValue: any;
    linkedElement: string;
    // if this is missing we need to remove the element from form
    newConfig?: Dictionary<any>;
    // we need to mix this dictionary with the default one so we get a new element and not miss some data inside it
}

export interface Dictionary<T> {
    [index: string]: T;
}

export interface FormGroupValidatorMetadata {
    type: string;
    staticMetadata?: any;
    ranking?: number;
    fieldsMap?: any;
    errorField?: string;
}

