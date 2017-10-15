import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
    IElementConfig, Dictionary, IFormConfig, IMappedFormConfig, IRowElementsConfig, IElementChangePayload, IFoundElementParams
} from './configurable-form.interfaces';
import { ValidationFactoryService } from './validation-factory.service';

@Injectable()
export class ConfigurableFormService {

    constructor(private _validationFactory: ValidationFactoryService) {
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
        flattenConfigRef.forEach(value => this.updateElementValidation(
            formGroup,
            value
        ));

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
        this.updateElementValidation(ngFormControls, newElConfig);

        this.findInConfig(currentConfig, null, newElConfig.name,
            (params: IFoundElementParams) => {
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
        );
        return currentConfig;
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
                    const changeAction = this.getConfigChangeAction(elementDesc, changeConfig.configurationChange);
                    if (this.areElementsEquals(changeAction.element, elementDesc)) {
                        elementDesc.isDefaultConfig = false;
                        configurationChangeChain.push(this.getConfigChangeAction(elementDesc, changeConfig.configurationChange));
                    }
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

    private updateElementValidation(ngFormControls: FormGroup, newElConfig: IElementConfig) {
        if (newElConfig.hidden) {
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
    }

    private findElement(group: IRowElementsConfig,
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

            if (!element[key] || newElement[key] !== element[key]) {
                return false;
            }
        }

        return true;
    }
}
