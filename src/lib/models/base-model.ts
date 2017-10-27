import { Dictionary } from './shared.interfaces';
import { utils } from './utils';

export abstract class BaseModel {
    _original: Dictionary<string>;
    _lastCompiled: Dictionary<string>;
    _wasTouched: boolean;

    throwError(errorMsg: string) {
        throw new Error(errorMsg + ' , context: ' + JSON.stringify(this));
    }

    isEqual(element: Dictionary<any>): boolean {
        return utils.areEqual(this, element, ['_original', '_lastCompiled', '_wasTouched']);
    }


}
