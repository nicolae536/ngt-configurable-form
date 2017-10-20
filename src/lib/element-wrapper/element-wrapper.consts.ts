import { IMatSelectElement } from '../configuratble-form/configurable-form.interfaces';

export const elementErrorMessages = {
    notDefined: 'Element not defined',
    invalidConfig: 'Element config is invalid',
    invalidDataProvider: 'Element data provider must be an observable',
};

export const elementWrapperError = {
    throwIfNotDefined: (elment: any, errorMessage: string = elementErrorMessages.notDefined) => {
        if (elment === null || elment === undefined) {
            throw new Error(errorMessage + ' , ' + JSON.stringify(elment));
        }
    },

    throwIfConfigInvalid(elment: IMatSelectElement, elementDataProvider) {
        if (!elment.selectConfig) {
            throw new Error(elementErrorMessages.invalidConfig + ' , ' + JSON.stringify(elment));
        }

        if (!Array.isArray(elment.selectConfig.visibleProps)) {
            throw new Error(elementErrorMessages.invalidConfig + ', ' + JSON.stringify(elment));
        }

        if (!elementDataProvider && !Array.isArray(elment.selectConfig.optionsList)) {
            throw new Error(elementErrorMessages.invalidDataProvider + ', ' + JSON.stringify(elment));
        }

    }
};
