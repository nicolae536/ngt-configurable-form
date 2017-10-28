import { Injectable } from '@angular/core';
import { IFormConfig } from '../models/groups.config.interfaces';
import { NgtFormSchema } from '../models/ngt-form-schema';
import { ValidationFactoryService } from './validation-factory.service';

@Injectable()
export class ConfigurableFormService {

    constructor(private _validationFactory: ValidationFactoryService) {
    }

    parseConfiguration(initialFormConfig: IFormConfig, _lastValueFromParent: any): NgtFormSchema {
        const formSchema = new NgtFormSchema(initialFormConfig, this._validationFactory);
        formSchema.setValueWithLayoutChange(_lastValueFromParent);

        return formSchema;
    }

    // fetchValidation(formSchema: NgtFormSchema) {
    //     const uiElements = formSchema.getUiElements();
    //     const groupUiElements = formSchema.getGroupUiElements();
    //
    //     for (const key in uiElements) {
    //         const uiElement = uiElements[key];
    //         uiElement.setValidation(
    //             this._validationFactory.getElementValidation(formSchema.ngFormGroup, uiElement)
    //         );
    //     }
    //
    //     for (const key in groupUiElements) {
    //         const groupUiElement = groupUiElements[key];
    //         groupUiElement.setValidation(
    //             this._validationFactory.getElementValidation(formSchema.ngFormGroup, groupUiElement)
    //         );
    //     }
    // }

    // parseConfiguration(initialFormConfig: IFormConfig, latestFormValue: Dictionary<any>): IMappedFormConfig {
    //     const flattenConfigRef = new Map<string, IElementConfig | IGroupElementConfig>();
    //     const ngFormControls: Dictionary<FormControl> = {};
    //
    //     if (!initialFormConfig || !Array.isArray(initialFormConfig.groupElements)) {
    //         return;
    //     }
    //     this.flattenControlsAndBuildGroup(initialFormConfig, ngFormControls, flattenConfigRef);
    //     const formGroup = new FormGroup(ngFormControls);
    //     if (latestFormValue) {
    //         formGroup.patchValue(latestFormValue, {
    //             onlySelf: true,
    //             emitEvent: false
    //         });
    //     }
    //     initialFormConfig = this.fetchConfigurationChanges(initialFormConfig, flattenConfigRef, formGroup);
    //     this.applyValidationOnControls(flattenConfigRef, formGroup);
    //
    //     return {
    //         formConfig: initialFormConfig,
    //         ngFormControls: formGroup,
    //         flattenConfigRef: flattenConfigRef
    //     };
    // }
    //
    // private applyValidationOnControls(flattenConfigRef: Map<string, IElementConfig | IGroupElementConfig>, formGroup: FormGroup) {
    //     flattenConfigRef.forEach(element => this._configurationChangeFactory.updateElementValidation(
    //         formGroup,
    //         element
    //     ));
    // }
    //
    // unWrapFormValue(ngFormGroup: FormGroup): { formValue: Dictionary<any>, formValidity: Dictionary<boolean> } {
    //     const formValue = ngFormGroup.getRawValue();
    //     const formValidity = {};
    //
    //     for (const name in ngFormGroup.controls) {
    //         if (ngFormGroup.get(name)) {
    //             formValidity[name] = ngFormGroup.get(name).valid;
    //         }
    //     }
    //
    //     return {
    //         formValidity,
    //         formValue
    //     };
    // }
    //
    // private flattenControlsAndBuildGroup(initialFormConfig: IFormConfig,
    //                                      ngFormControls: Dictionary<FormControl>,
    //                                      flattenConfigRef: Map<string, IElementConfig | IGroupElementConfig>) {
    //     initialFormConfig.groupElements.forEach(group => {
    //         if (!group || !Array.isArray(group.elements)) {
    //             return;
    //         }
    //         flattenConfigRef.set(group.name, group);
    //         group.elements.forEach(elem => {
    //
    //             elem.elementsOnLine.forEach(lineElem => {
    //                 if (lineElem.type === 'divider') {
    //                     return;
    //                 }
    //
    //                 ngFormControls[lineElem.name] = new FormControl(lineElem.value);
    //                 lineElem.disabled
    //                     ? ngFormControls[lineElem.name].disable({emitEvent: false, onlySelf: true})
    //                     : ngFormControls[lineElem.name].enable({emitEvent: false, onlySelf: true});
    //                 flattenConfigRef.set(lineElem.name, lineElem);
    //             });
    //         });
    //     });
    // }
    //
    // private fetchConfigurationChanges(initialFormConfig: IFormConfig,
    //                                   flattenConfigRef: Map<string, IElementConfig | IGroupElementConfig>,
    //                                   formGroup: FormGroup) {
    //     const newConfig = this._configurationChangeFactory.stabilizeConfigurationStructure(
    //         initialFormConfig,
    //         flattenConfigRef,
    //         formGroup
    //     );
    //     if (newConfig) {
    //         initialFormConfig = newConfig;
    //     }
    //     return initialFormConfig;
    // }
}
