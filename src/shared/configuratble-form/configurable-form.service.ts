import { Injectable } from '@angular/core';
import { IElementConfig, Dictionary, IFormConfig, IMappedFormConfig } from './configurable-form.interfaces';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ConfigurableFormService {

    constructor() {
    }

    parseInitialConfig(config: IFormConfig): IMappedFormConfig {
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

                    if (lineElem.type === 'select' && !(lineElem.config.options instanceof Observable)) {
                        lineElem.config.options = Observable.of(lineElem.config.options);
                    }
                });
            });
        });

        return {
            formConfig: config,
            ngFormControls: ngFormControls,
            flattenConfigRef: flattenConfigRef
        };
    }
}