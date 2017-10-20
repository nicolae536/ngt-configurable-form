import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
    IElementConfig, IFormConfig, IGroupElementsConfig, IElementChangePayload, IFoundElementParams
} from './configurable-form.interfaces';
import { ValidationFactoryService } from './validation-factory.service';

@Injectable()
export class ConfigurationChangeFactoryService {
    constructor(private _validationFactory: ValidationFactoryService) {
    }

    /**
     * loop over form element and stabilize the new configuration in one run
     * @param {IFormConfig} formConfiguration
     * @param {Map<string, IElementConfig>} flattenConfigRef
     * @param {FormGroup} ngFormGroup
     * @returns {any}
     */
    stabilizeConfigurationStructure(formConfiguration: IFormConfig, flattenConfigRef: Map<string, IElementConfig>, ngFormGroup: FormGroup) {
        const configurationChangeChain: IElementChangePayload[] = this.getConfigurationUpdates(flattenConfigRef, ngFormGroup);
        let newConfig = null;
        configurationChangeChain.forEach(changePayload => {
            newConfig = this.changeConfiguration(changePayload, newConfig || formConfiguration, flattenConfigRef, ngFormGroup);
        });
        return newConfig;
    }

    /**
     * @desc based on a payload which describes a new elemnt data we should update the elemnt in accordingly
     * @param {IElementChangePayload} payload
     * @param {IFormConfig} lastFormConfig
     * @param {Map<string, IElementConfig>} flattenConfigRef
     * @param {FormGroup} ngFormControls
     * @returns {IFormConfig}
     */
    changeConfiguration(payload: IElementChangePayload,
                        lastFormConfig: IFormConfig,
                        flattenConfigRef: Map<string, IElementConfig>,
                        ngFormControls: FormGroup): IFormConfig {
        const newElConfig = this.getNewElementConfig(flattenConfigRef, payload);
        this.updateNgFormControl(ngFormControls, payload, newElConfig, flattenConfigRef.get(payload.element.name));
        flattenConfigRef.set(payload.element.name, newElConfig);

        this.findInConfig(lastFormConfig, null, newElConfig.name,
            (params: IFoundElementParams) => {
                this.updateReferencesInFormConfig(params, newElConfig);
            }
        );
        return lastFormConfig;
    }

    /**
     * @desc updates angular element validation
     * @param {FormGroup} ngFormControls
     * @param {IElementConfig} newElConfig
     */
    updateElementValidation(ngFormControls: FormGroup, newElConfig: IElementConfig) {
        if (newElConfig.hidden || newElConfig.disabled) {
            const control = ngFormControls.get(newElConfig.name);
            control.validator = () => null;
            control.updateValueAndValidity({onlySelf: false, emitEvent: false});
            return;
        }

        if (newElConfig && !newElConfig.validation) {
            return;
        }

        ngFormControls.get(newElConfig.name).setValidators(
            this._validationFactory.getElementValidation(
                ngFormControls,
                newElConfig,
            )
        );
        ngFormControls.get(newElConfig.name).updateValueAndValidity({onlySelf: false, emitEvent: false});
    }

    /**
     * @desc loop over the flattenConfigRef and build a chain of configuration updates which need to be performed to the form
     * @param {Map<string, IElementConfig>} flattenConfigRef
     * @param {FormGroup} ngFormGroup
     * @returns {IElementChangePayload[]}
     */
    private getConfigurationUpdates(flattenConfigRef: Map<string, IElementConfig>, ngFormGroup: FormGroup): IElementChangePayload[] {
        const currentChangesChain: IElementChangePayload[] = [];
        flattenConfigRef.forEach(elementDesc => {
            if (!elementDesc ||
                !elementDesc.configurationChangeMap) {
                return;
            }

            // Try to update the chain
            if (this.updateChangesChain(currentChangesChain, ngFormGroup, elementDesc)) {
                // stop if the chain was partially updated
                return;
            }

            // check if the last applyed config is the default one
            if (!elementDesc.isDefaultConfig) {
                // apply default config if the element was not updated
                elementDesc.isDefaultConfig = true;
                currentChangesChain.push(this.getNewConfigurationPayload(elementDesc, elementDesc.configurationChangeMap.defaultConfig));
            }
        });

        return currentChangesChain;
    }

    /**
     * @desc compose a new IElementChangePayload
     * @param {IElementConfig} element
     * @param {IElementConfig} newConfig
     * @returns {IElementChangePayload}
     */
    private getNewConfigurationPayload(element: IElementConfig, newConfig: IElementConfig): IElementChangePayload {
        return {
            element: {
                ...element,
                ...newConfig
            }
        };
    }

    /**
     * @desc returns if an update was tried on the chain or false if not
     * @param {IElementChangePayload[]} currentChangesChain
     * @param {FormGroup} ngFormGroup
     * @param {IElementConfig} elementDesc
     * @returns {boolean}
     */
    private updateChangesChain(currentChangesChain: IElementChangePayload[],
                               ngFormGroup: FormGroup,
                               elementDesc: IElementConfig): boolean {
        // loop over configurationChangeMap to check if a configuration should be applyed
        for (const changeConfig of elementDesc.configurationChangeMap.configurationChange) {
            const currentControl = ngFormGroup.get(changeConfig.linkedElement);
            if (!currentControl) {
                // no control -> move to the next possible link
                continue;
            }

            // check value for matches
            if (changeConfig.expectedValue === currentControl.value) {
                // the value matched we must stop the iteration -> we stop at first match
                const changedElementConfig = this.getNewConfigurationPayload(elementDesc, changeConfig.configurationChange);
                if (!this.areElementsEquals(changedElementConfig.element, elementDesc)) {
                    changedElementConfig.element.isDefaultConfig = false;
                    // push the new change to the chain is was not applied before
                    currentChangesChain.push(changedElementConfig);
                }

                // we need to know if the match was successful or not
                return true;
            }
        }

        return false;
    }

    /**
     * @desc checks if two configurations look the same
     * @param {IElementConfig} element
     * @param {IElementConfig} newElement
     * @returns {boolean}
     */
    private areElementsEquals(element: IElementConfig, newElement: IElementConfig) {
        const elementKeys = Object.keys(element);
        const newElementKeys = Object.keys(newElement);

        if (elementKeys.length !== newElementKeys.length) {
            return false;
        }

        for (const key of newElementKeys) {
            if (key === 'isDefaultConfig' || key === 'configurationChangeMap') {
                continue;
            }

            if (!element.hasOwnProperty(key) || newElement[key] !== element[key]) {
                return false;
            }
        }

        return true;
    }

    /**
     * @desc combines IElementChangePayload with the current element config to get the new configuration
     * @param {Map<string, IElementConfig>} flattenConfigRef
     * @param {IElementChangePayload} payload
     * @returns {IElementConfig}
     */
    private getNewElementConfig(flattenConfigRef: Map<string, IElementConfig>, payload: IElementChangePayload): IElementConfig {
        const elementConfig: IElementConfig = flattenConfigRef.get(payload.element.name) || {} as IElementConfig;
        return {...elementConfig, ...payload.element};
    }

    /**
     * @desc update the ngControl in the current form group,
     * we need to recreate the local element and recompile it's validation
     * @param {FormGroup} ngFormControls
     * @param {IElementChangePayload} payload
     * @param {IElementConfig} newElConfig
     * @param {IElementConfig} oldElement
     */
    private updateNgFormControl(ngFormControls: FormGroup,
                                payload: IElementChangePayload,
                                newElConfig: IElementConfig,
                                oldElement: IElementConfig) {
        let elementValue = newElConfig.value;
        if (elementValue === undefined && ngFormControls.get(oldElement.name)) {
            elementValue = ngFormControls.get(oldElement.name).value;
        }
        ngFormControls.removeControl(payload.element.name);
        ngFormControls.addControl(payload.element.name, new FormControl());
        this.updateElementValidation(ngFormControls, newElConfig);
        if (elementValue !== undefined) {
            ngFormControls.get(payload.element.name).setValue(elementValue, {onlySelf: true, emitEvent: false});
        }

        newElConfig.disabled
            ? ngFormControls.get(newElConfig.name).disable({onlySelf: true, emitEvent: false})
            : ngFormControls.get(newElConfig.name).enable({onlySelf: true, emitEvent: false});
    }

    private findInConfig(currentConfig: IFormConfig,
                         groupIndex: string,
                         elementId: string = null,
                         elementCallback: (foundElementParams: IFoundElementParams) => void) {
        for (const gIdx in currentConfig.groupElements) {
            if (!currentConfig.groupElements[gIdx]) {
                continue;
            }

            const group = currentConfig.groupElements[gIdx];
            if (gIdx === groupIndex) {
                if (!elementId) {
                    elementCallback({
                        index: -1,
                        element: null,
                        group: group,
                        lineIndex: +gIdx,
                        parentElementArray: currentConfig.groupElements
                    });
                    return;
                }

                if (this.findElement(group, elementId, elementCallback)) {
                    return;
                }
                continue;
            }

            if (this.findElement(group, elementId, elementCallback)) {
                return;
            }
        }
    }

    private findElement(group: IGroupElementsConfig,
                        elementId: string = null,
                        elementCallback: (foundElementParams: IFoundElementParams) => any) {
        if (!elementId) {
            return false;
        }

        for (const lineIdx in group.elements) {
            if (!group.elements[lineIdx]) {
                continue;
            }
            const line = group.elements[lineIdx];

            for (const idx in line.elementsOnLine) {
                if (!line.elementsOnLine[idx]) {
                    continue;
                }
                const element = line.elementsOnLine[idx];
                if (elementId === element.name) {
                    elementCallback({
                        index: +idx,
                        element: element,
                        group: group,
                        lineIndex: +lineIdx,
                        parentElementArray: line.elementsOnLine
                    });
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @desc updates the references in the original arrays to trigger a new change detection
     * @param {IFoundElementParams} params
     * @param {IElementConfig} newElConfig
     */
    private updateReferencesInFormConfig(params: IFoundElementParams, newElConfig: IElementConfig) {
        if (params && !params.element) {
            return;
        }

        params.parentElementArray[params.index] = newElConfig;

        if (params.parentElementArray && params.parentElementArray.length === 1) {
            params.group.elements[params.lineIndex] = {
                ...params.group.elements[params.lineIndex],
                elementsOnLine: [...params.group.elements[params.lineIndex].elementsOnLine]
            };
        }
    }
}
