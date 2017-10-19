import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IElementConfig, Dictionary, IFormConfig, IMappedFormConfig } from './configurable-form.interfaces';
import { ConfigurationChangeFactoryService } from './configuration-change-factory.service';

@Injectable()
export class ConfigurableFormService {

    constructor(private _configurationChangeFactory: ConfigurationChangeFactoryService) {
    }

    parseConfiguration(initialFormConfig: IFormConfig): IMappedFormConfig {
        const flattenConfigRef = new Map<string, IElementConfig>();
        const ngFormControls: Dictionary<FormControl> = {};

        if (!initialFormConfig || !Array.isArray(initialFormConfig.groupElements)) {
            return;
        }
        initialFormConfig.groupElements.forEach(group => {
            if (!group || !Array.isArray(group.elements)) {
                return;
            }

            group.elements.forEach(elem => {
                elem.elementsOnLine.forEach(lineElem => {
                    if (lineElem.type === 'divider') {
                        return;
                    }

                    ngFormControls[lineElem.name] = new FormControl(lineElem.value);
                    flattenConfigRef.set(lineElem.name, lineElem);
                });
            });
        });

        const formGroup = new FormGroup(ngFormControls);
        initialFormConfig = this._configurationChangeFactory.stabilizeConfigurationStructure(
            initialFormConfig,
            flattenConfigRef,
            formGroup
        );
        flattenConfigRef.forEach(element => this._configurationChangeFactory.updateElementValidation(
            formGroup,
            element
        ));

        return {
            formConfig: initialFormConfig,
            ngFormControls: formGroup,
            flattenConfigRef: flattenConfigRef
        };
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
}
