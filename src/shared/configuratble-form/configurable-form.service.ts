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

        const formGroup = new FormGroup(ngFormControls);
        config = this.changeConfigurationIfNeeded(
            config,
            flattenConfigRef,
            formGroup
        );

        return {
            formConfig: config,
            ngFormControls: formGroup,
            flattenConfigRef: flattenConfigRef
        };
    }

    doConfigurationChange(payload: IElementChangePayload,
                          currentConfig: IFormConfig,
                          flattenConfigRef: Map<string, IElementConfig>,
                          ngFormControls: FormGroup): IFormConfig {
        // TODO ngFormControls compile validation
        const elementConfig: IElementConfig = flattenConfigRef.get(payload.element.name) || {} as IElementConfig;
        const newElConfig = {...elementConfig, ...payload.element};
        flattenConfigRef.set(payload.element.name, newElConfig);

        ngFormControls.removeControl(payload.element.name);
        ngFormControls.addControl(payload.element.name, new FormControl());
        if (elementConfig.hidden) {
            const control = ngFormControls.get(elementConfig.name);
            control.validator = () => null;
            control.updateValueAndValidity({onlySelf: false, emitEvent: false});
        }

        this.findInConfig(currentConfig, null, newElConfig.name,
            (index: number, element: any, parentArray: any[], isGroup: boolean) => {
                parentArray[index] = newElConfig;
            }
        );
        return currentConfig;
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

    private findInConfig(currentConfig: IFormConfig,
                         groupId: string,
                         elementId: string = null,
                         callback: (index: number, element: any, parentArray: any[], isGroup: boolean) => any) {
        for (const gIdx in currentConfig.groupElements) {
            if (!currentConfig.groupElements[gIdx]) {
                continue;
            }

            const group = currentConfig.groupElements[gIdx];
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

        for (const line of group.elements) {
            if (!line) {
                continue;
            }

            for (const idx in line.elementsOnLine) {
                if (!line.elementsOnLine[idx]) {
                    continue;
                }
                const element = line.elementsOnLine[idx];
                if (elementId === element.name) {
                    callback(+idx, element, line.elementsOnLine, false);
                    return true;
                }
            }
        }
        return false;
    }

    unWrapFormValue(ngFormGroup: FormGroup): { formValue: any, formValidity: Dictionary<boolean> } {
        const formValue = ngFormGroup.getRawValue();
        const formValidity = {};

        for (const name in ngFormGroup.controls) {
            if (ngFormGroup.get(name)) {
                formValidity[name] = ngFormGroup.get(name).valid;
            }
        }

        return {
            formValidity,
            formValue
        };
    }

    changeConfigurationIfNeeded(formConfiguration: IFormConfig, flattenConfigRef: Map<string, IElementConfig>, ngFormGroup: FormGroup) {
        const configurationChangeChain: IElementChangePayload[] = [];
        let newConfig = null;
        flattenConfigRef.forEach(elementDesc => {
            if (!elementDesc || !elementDesc.configurationChangeMap) {
                return;
            }

            const configurationChange = {
                element: {
                    name: elementDesc.name,
                    isDefaultConfig: true
                }
            };

            for (const changeConfig of elementDesc.configurationChangeMap.configurationChange) {
                const currentControl = ngFormGroup.get(changeConfig.linkedElement);
                if (!currentControl) {
                    continue;
                }

                if (changeConfig.expectedValue === currentControl.value) {
                    elementDesc.isDefaultConfig = false;
                    configurationChangeChain.push(this.getConfigChangeAction(elementDesc, changeConfig.configurationChange));
                    return;
                }
            }

            if (!elementDesc.isDefaultConfig) {
                elementDesc.isDefaultConfig = true;
                configurationChangeChain.push(this.getConfigChangeAction(elementDesc, elementDesc.configurationChangeMap.defaultConfig));
            }
        });

        configurationChangeChain.forEach(c => {
            newConfig = this.doConfigurationChange(c, newConfig || formConfiguration, flattenConfigRef, ngFormGroup);
        });
        return newConfig;
    }

    private getConfigChangeAction(element: IElementConfig, newConfig: IElementConfig): IElementChangePayload {
        return {
            element: {
                ...element,
                ...newConfig
            }
        };
    }

    private noConfigurationChange(value) {
        return !value ||
            !value.configurationChangeMap ||
            !value.configurationChangeMap.defaultConfig ||
            !value.configurationChangeMap.configurationChange;
    }
}

export interface IElementChangePayload {
    element: IElementConfig;
    groupName?: string;
    afterElement?: string;
}
