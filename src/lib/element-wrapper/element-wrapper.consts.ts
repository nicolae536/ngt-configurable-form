import { IMatSelectElement } from '../models/element.config.interfaces';

export const elementErrorMessages = {
    notDefined: 'Element not defined',
    noType: 'Cannot create UiElement without type',
    noSelectConfig: 'Select | Autocomplete element must have a selectConfig',
    noSelectVisibleProps: 'Select | Autocomplete element must have a selectConfig.visibleProps of type string[]',
    noDateConfig: 'Datepicker must have a dateConfig',
    noRadioConfig: 'RadioGroup must have radioElements of type IMatRadioButtonElement[]',
    invalidRadioElement: 'IMatRadioButtonElement must have value: any',
    invalidDataProvider: 'Element data provider must be an observable',
};

export const elementWrapperError = {
    throwIfNotDefined: (elment: any, errorMessage: string = elementErrorMessages.notDefined) => {
        if (elment === null || elment === undefined) {
            throw new Error(errorMessage + ' , ' + JSON.stringify(elment));
        }
    },

    throwIfConfigInvalid(elment: IMatSelectElement, elementDataProvider) {
        if (!elementDataProvider && !Array.isArray(elment.selectConfig.optionsList)) {
            throw new Error(elementErrorMessages.invalidDataProvider + ', ' + JSON.stringify(elment));
        }
    }
};
