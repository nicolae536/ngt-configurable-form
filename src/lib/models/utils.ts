import { Dictionary } from './shared.interfaces';

export class UtilsService {
    cloneDeep<T>(obj: any | any[]): T {
        const isArray = this.isArray(obj);
        const result = {};
        const arrayResult: any = [];

        if (isArray) {
            for (const prop in obj as any[]) {
                const newVal = this.cloneDeep(obj[prop]);
                arrayResult.push(newVal);
            }
            return arrayResult as T;
        }

        if (this.isObject(obj)) {
            for (const prop in obj) {
                result[prop] = this.cloneDeep(obj[prop]);
            }
            return result as T;
        }

        return obj as T;
    }

    findValueByKey(obj: Object, key: string): any {
        if (!obj) {
            return null;
        }

        if (!this.isArray(obj) &&
            !this.isObject(obj)) {
            return null;
        }

        for (const idx in obj) {
            if (idx === key) {
                return obj[idx];
            }

            const data = this.findValueByKey(obj[idx], key);
            if (data) {
                return data;
            }
        }
    }

    areEqual(obj: any, obj1: any, ignoredProps: string[] = []) {
        if (!obj && !obj1) {
            return true;
        }

        if (!obj || !obj1) {
            return false;
        }

        const isObjArray = this.isArray(obj);
        const isObj1Array = this.isArray(obj1);

        if (isObjArray && isObj1Array) {
            return this.areArraysEquals(obj as any[], obj1 as any[], ignoredProps);
        }

        const isObjObject = this.isObject(obj);
        const isObj1Object = this.isObject(obj1);

        if (isObjObject && isObj1Object) {
            return this.areObjectsEquals(obj, obj1, ignoredProps);
        }

        return obj === obj1;
    }

    isNullOrUndefined(value: any): boolean {
        return value === null || value === undefined;
    }

    isFunction(value): boolean {
        return value instanceof Function;
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    isObject(value): boolean {
        return !this.isArray(value) &&
            !this.isFunction(value) &&
            value instanceof Object &&
            (typeof value !== 'string');
    }

    throwError(errorMsg: string, context: any) {
        throw new Error(errorMsg + ' , context: ' + JSON.stringify(context));
    }

    private areArraysEquals(obj: any[], obj1: any[], ignoredProps: string[]): boolean {
        if (!obj && !obj1) {
            return true;
        }

        if (!obj || !obj1 || obj.length !== obj1.length) {
            return false;
        }

        let wasFound = false;
        let idx = 0;
        let idx1 = 0;
        const foundIndexes: Dictionary<boolean> = {};
        while (idx < obj.length) {
            wasFound = false;
            idx1 = 0;
            while (idx1 < obj1.length && !wasFound) {
                if (!foundIndexes[idx1] && this.areEqual(obj[idx], obj1[idx1], ignoredProps)) {
                    wasFound = true;
                }
                idx1++;
            }
            idx++;
            if (!wasFound) {
                return false;
            }
            foundIndexes[idx1] = true;
        }
        return true;
    }

    private areObjectsEquals(obj: Dictionary<any>, obj1: Dictionary<any>, ignoredProps: string[]) {
        if (!obj && !obj1) {
            return true;
        }

        if (!obj || !obj1) {
            return false;
        }

        const objeKeys = Object.keys(obj).filter(key => ignoredProps.indexOf(key) === -1);
        const obje1Keys = Object.keys(obj1).filter(key => ignoredProps.indexOf(key) === -1);

        if (objeKeys.length !== obje1Keys.length) {
            return false;
        }

        for (const prop in obj) {
            if (ignoredProps.indexOf(prop) !== -1) {
                continue;
            }

            if (!this.areEqual(obj[prop], obj1[prop], ignoredProps)) {
                return false;
            }
        }

        return true;
    }
}

export const utils = new UtilsService();
