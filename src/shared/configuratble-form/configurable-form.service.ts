import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IElementConfig, Dictionary, IFormConfig, IMappedFormConfig, IRowElementsConfig } from './configurable-form.interfaces';

@Injectable()
export class ConfigurableFormService {

    constructor() {
    }

    parseConfiguration(config: IFormConfig): IMappedFormConfig {
        const flattenConfigRef = new Map<string, IElementConfig>();
        const ngFormControls: Dictionary<FormControl> = {};

        if (!config || !Array.isArray(config.groupElements)) {
            return;
        }
        config.groupElements.forEach(group => {
            if (!group || !Array.isArray(group.elements)) {
                return;
            }

            group.elements.forEach(elem => {
                elem.elementsOnLine.forEach(lineElem => {
                    ngFormControls[lineElem.name] = new FormControl();
                    flattenConfigRef.set(lineElem.name, lineElem);
                });
            });
        });

        return {
            formConfig: config,
            ngFormControls: ngFormControls,
            flattenConfigRef: flattenConfigRef
        };
    }

    doConfigurationChange(change: IConfigurationChange,
                          currentConfig: IFormConfig,
                          flattenConfigRef: Map<string, IElementConfig>,
                          ngFormControls: FormGroup): IFormConfig {

        switch (change.type) {
            case CONFIGURATION_CHANGE_ACTIONS.INSERT_ELEMENT:
                return this.insertElementInConfig(change.payload, currentConfig, flattenConfigRef, ngFormControls);
            case CONFIGURATION_CHANGE_ACTIONS.UPDATE_ELEMENT:
                return this.updateElement(change.payload, currentConfig, flattenConfigRef, ngFormControls);
            case CONFIGURATION_CHANGE_ACTIONS.REMOVE_ELEMENT:
                return this.removeElement(change.payload, currentConfig, flattenConfigRef, ngFormControls);
        }
    }

    private insertElementInConfig(payload: IElementChangePayload,
                                  currentConfig: IFormConfig,
                                  flattenConfigRef: Map<string, IElementConfig>,
                                  ngFormControls: FormGroup): IFormConfig {
        // TODO ngFormControls compile validation
        if (!flattenConfigRef.get(payload.element.name)) {
            flattenConfigRef.set(payload.element.name, payload.element);
        }

        ngFormControls.addControl(payload.element.name, new FormControl());

        this.findInConfig(currentConfig, payload.groupName, payload.afterElement,
            (index: number, element: any, parentArray: any[], isGroup: boolean) => {
                parentArray.splice(index, 0, payload.element);
            });
        return currentConfig;
    }

    private updateElement(payload: IElementChangePayload,
                          currentConfig: IFormConfig,
                          flattenConfigRef: Map<string, IElementConfig>,
                          ngFormControls: FormGroup): IFormConfig {
        // TODO ngFormControls compile validation
        let elementConfig: IElementConfig = flattenConfigRef.get(payload.element.name) || {} as IElementConfig;
        elementConfig = {...elementConfig, ...payload.element};
        flattenConfigRef.set(payload.element.name, elementConfig);

        ngFormControls.removeControl(payload.element.name);
        ngFormControls.addControl(payload.element.name, new FormControl());

        this.findInConfig(currentConfig, payload.groupName, payload.element.name,
            (index: number, element: any, parentArray: any[], isGroup: boolean) => {
                parentArray[index] = elementConfig;
                if (elementConfig.hidden) {
                    let control = ngFormControls.get(element.name);
                    control.validator = () => null;
                    control.updateValueAndValidity({onlySelf: false, emitEvent: false});
                }
            });
        return currentConfig;
    }

    private removeElement(payload: IElementChangePayload,
                          currentConfig: IFormConfig,
                          flattenConfigRef: Map<string, IElementConfig>,
                          ngFormControls: FormGroup): IFormConfig {
        // TODO ngFormControls compile validation
        if (flattenConfigRef.get(payload.element.name)) {
            flattenConfigRef.delete(payload.element.name);
        }

        ngFormControls.removeControl(payload.element.name);

        this.findInConfig(currentConfig, payload.groupName, payload.element.name,
            (index: number, element: any, parentArray: any[], isGroup: boolean) => {
                parentArray.splice(index, 1);
            });
        return currentConfig;
    }

    private findInConfig(currentConfig: IFormConfig,
                         groupId: string,
                         elementId: string = null,
                         callback: (index: number, element: any, parentArray: any[], isGroup: boolean) => any) {
        for (let gIdx in currentConfig.groupElements) {
            let group = currentConfig.groupElements[gIdx];
            if (groupId && group.name === groupId) {
                if (!elementId) {
                    callback(+gIdx, group, currentConfig.groupElements, true);
                    return;
                }

                if (this.findElement(group, elementId, callback)) {
                    return;
                }
                continue;
            }

            if (this.findElement(group, elementId, callback)) {
                return;
            }
        }
    }

    private findElement(group: IRowElementsConfig,
                        elementId: string = null,
                        callback: (index: number, element: any, parentArray: any[], isGroup: boolean) => any) {
        if (!elementId) {
            return false;
        }

        for (let line of group.elements) {
            for (let idx in line.elementsOnLine) {
                let element = line.elementsOnLine[idx];
                if (elementId === element.name) {
                    callback(+idx, element, line.elementsOnLine, false);
                    return true;
                }
            }
        }
        return false;
    }

    unWrapFormValue(ngFormGroup: FormGroup): { formValue: any, formValidity: Dictionary<boolean> } {
        let formValue = ngFormGroup.getRawValue();
        let formValidity = {};

        for (let name in ngFormGroup.controls) {
            formValidity[name] = ngFormGroup.get(name).valid;
        }

        return {
            formValidity,
            formValue
        };
    }

    changeConfigurationIfNeeded(formConfiguration: IFormConfig, flattenConfigRef: Map<string, IElementConfig>, ngFormGroup: FormGroup) {
        let configurationChangeChain: IConfigurationChange[] = [];
        let newConfig = null;
        formConfiguration.groupElements.forEach(group => {
            group.elements.forEach(groupElement => {
                groupElement.elementsOnLine.forEach(element => {

                    if (this.noConfigurationChange(element)) {
                        return;
                    }

                    let elementName = element.name;
                    let configurationChange = {
                        type: CONFIGURATION_CHANGE_ACTIONS.UPDATE_ELEMENT,
                        payload: {
                            element: {
                                name: element.name
                            }
                        }
                    };

                    for (let changeConfig of element.configurationChangeMap.configurationChange) {
                        let currentControl = ngFormGroup.get(changeConfig.linkedElement);
                        if (!currentControl) {
                            continue;
                        }

                        if (changeConfig.expectedValue === currentControl.value) {
                            configurationChangeChain.push(this.getConfigChangeAction(element, changeConfig.configurationChange));
                            return;
                        }
                    }

                    if (!element.isDefaultConfig) {
                        configurationChangeChain.push(this.getConfigChangeAction(element, element.configurationChangeMap.defaultConfig));
                    }
                })
            })
        });
        configurationChangeChain.forEach(c => {
            newConfig = this.doConfigurationChange(c, newConfig || formConfiguration, flattenConfigRef, ngFormGroup);
        });

        return newConfig;
    }

    private getConfigChangeAction(elment: any, newConfig) {
        let data = {
            type: newConfig && newConfig.type ? newConfig.type : CONFIGURATION_CHANGE_ACTIONS.UPDATE_ELEMENT,
            payload: newConfig && newConfig.payload
                ? {...newConfig.payload}
                : newConfig ? {element: {...newConfig}} : {}
        };

        if (!data.payload.element) {
            data.payload.element = {};
        }

        data.payload.element.name = elment.name;

        return data;
    }

    private noConfigurationChange(value) {
        return !value ||
            !value.configurationChangeMap ||
            !value.configurationChangeMap.defaultConfig ||
            !value.configurationChangeMap.configurationChange;
    }
}

export interface IConfigurationChange {
    type: string;
    payload: IElementChangePayload;
}

export interface IElementChangePayload {
    element: IElementConfig,
    groupName?: string;
    afterElement?: string;
}

export const CONFIGURATION_CHANGE_ACTIONS = {
    UPDATE_ELEMENT: "UPDATE_ELEMENT",
    INSERT_ELEMENT: "INSERT_ELEMENT",
    REMOVE_ELEMENT: "REMOVE_ELEMENT"
};