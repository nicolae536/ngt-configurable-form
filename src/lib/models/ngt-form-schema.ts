import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { ValidationFactoryService } from '../configuratble-form/validation-factory.service';
import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { BaseElement } from './base-element';
import { IElementConfig } from './element.config.interfaces';
import { GROUP_TYPES, GroupUiElement } from './group-ui-element';
import { IFormConfig, IGroupElementConfig, ILayoutModel, ILayoutViewModel } from './groups.config.interfaces';
import { Dictionary, IConfigurationChangeDescription } from './shared.interfaces';
import { UiElement } from './ui-element';
import { utils } from './utils';

export class NgtFormSchema {
    name: string;
    ngFormGroup: FormGroup;
    attachedLayout: ILayoutViewModel;
    layoutModel: ILayoutModel;
    layoutUpdateStatus$: Subject<boolean> = new Subject<boolean>();

    private _uiGroupElementsMap: Dictionary<GroupUiElement> = {};
    private _uiElementsMap: Dictionary<UiElement> = {};
    private _linkDefinitions: Dictionary<IConfigurationChangeDescription> = {};

    constructor(jsonModel: IFormConfig,
                private _validationFactory: ValidationFactoryService) {
        this.validateModel(jsonModel);
        this.name = jsonModel.name;
        this.layoutModel = jsonModel.layout;
        this._linkDefinitions = jsonModel.linkDefinitions || {};
        this.ngFormGroup = new FormGroup({});

        this.compileUiElements(jsonModel.elements);
        this.compileUiGroupElements(jsonModel.groupElements);
        this.compileRemainedLinkElements();
        this.fetchValidation();
        this.attachedLayout = this.getInMemoryLayout();
    }

    getValue(): Object {
        return this.ngFormGroup.getRawValue();
    }

    setValueWithLayoutChange(value: any) {
        if (!value) {
            return;
        }

        this.ngFormGroup.patchValue(value, {onlySelf: false, emitEvent: false});
        this.changeLayoutIfNeeded();
    }

    changeLayoutIfNeeded() {
        if (!this.updateElementsUsingLinks()) {
            return;
        }

        let wasUpdated = false;
        this.attachedLayout.forEach(element => {
            if (element.group !== this._uiGroupElementsMap[element.group.name]) {
                element.group = this._uiGroupElementsMap[element.group.name];
                wasUpdated = true;
            }

            for (let line = 0; line < element.lines.length; line++) {
                for (let column = 0; column < element.lines[line].length; column++) {
                    const elementName = element.lines[line][column].name;
                    if (element.lines[line][column] !== this._uiElementsMap[elementName]) {
                        element.lines[line][column] = this._uiElementsMap[elementName];
                        wasUpdated = true;
                    }
                }
            }
        });

        this.layoutUpdateStatus$.next(wasUpdated);
    }

    setExpandedGroups(groups: Dictionary<boolean>) {
        if (utils.isNullOrUndefined(groups)) {
            return;
        }

        for (const key in this._uiGroupElementsMap) {
            this._uiGroupElementsMap[key].isExpanded = groups[key] ? true : false;
        }
        this.layoutUpdateStatus$.next(true);
    }

    setTouchedControls(touchedMap: Dictionary<boolean>) {
        if (utils.isNullOrUndefined(touchedMap)) {
            return;
        }

        this.markAsTouched(this._uiElementsMap, touchedMap);
        this.markAsTouched(this._uiGroupElementsMap, touchedMap);
    }

    getTouchedMap() {
        return {
            ...this.getTouchedFromElements(this._uiElementsMap),
            ...this.getTouchedFromElements(this._uiGroupElementsMap)
        };
    }

    destroy() {
        this.ngFormGroup.reset({}, {
            onlySelf: false,
            emitEvent: false
        });
        for (const key in this._uiGroupElementsMap) {
            this._uiGroupElementsMap[key].isExpanded = false;
        }
        this.attachedLayout = null;
        this.layoutUpdateStatus$.next(true);
        this.layoutUpdateStatus$.complete();
    }

    private validateModel(jsonModel: IFormConfig) {
        if (!jsonModel) {
            utils.throwError(elementErrorMessages.noFormConfig, this);
        }

        if (!utils.isArray(jsonModel.layout)) {
            utils.throwError(elementErrorMessages.invalidLayout, this);
        }
    }

    private compileUiElements(elements: IElementConfig[]) {
        if (!utils.isArray(elements)) {
            return;
        }

        for (const element of elements) {
            let newElement: Dictionary<any> = {...element};
            if (this._linkDefinitions.hasOwnProperty(element.name) &&
                this._linkDefinitions[element.name].defaultConfig) {
                newElement = {
                    ...element,
                    ...this._linkDefinitions[element.name].defaultConfig
                };
            }

            const uiElement = new UiElement(newElement);
            uiElement.attachControl(new FormControl());
            this._uiElementsMap[uiElement.name] = uiElement;
        }
    }

    private compileUiGroupElements(groupElements: IGroupElementConfig[]) {
        if (!utils.isArray(groupElements)) {
            return;
        }

        for (const group of groupElements) {
            let newGroupDef: Dictionary<any> = group;
            if (this._linkDefinitions.hasOwnProperty(group.name) &&
                this._linkDefinitions[group.name].defaultConfig) {
                newGroupDef = {
                    ...newGroupDef,
                    ...this._linkDefinitions[group.name].defaultConfig as any
                };
            }

            const groupUiElement = new GroupUiElement(newGroupDef);
            groupUiElement.attachControl(new FormGroup({}));
            this._uiGroupElementsMap[groupUiElement.name] = groupUiElement;
        }
    }

    private compileRemainedLinkElements() {
        // The links without default config can be evaluated only when the form value is applyer
        for (const key in this._linkDefinitions) {
            if (this._uiGroupElementsMap[key] ||
                this._uiElementsMap[key] ||
                !this._linkDefinitions[key].defaultConfig) {
                continue;
            }

            // we compile the remaining elements and add them to the cache map
            const elementData = {
                ...this._linkDefinitions[key].defaultConfig,
                name: key
            };
            switch (this._linkDefinitions[key].defaultConfig.type) {
                case GROUP_TYPES.matCard:
                case GROUP_TYPES.ngtCard:
                case GROUP_TYPES.matExpansionPane:
                    const groupElement = new GroupUiElement(elementData);
                    this._uiGroupElementsMap[key] = groupElement;
                    break;
                default:
                    const element = new UiElement(elementData);
                    this._uiElementsMap[key] = element;
                    break;
            }
        }
    }

    private fetchValidation() {
        for (const key in this._uiElementsMap) {
            const uiElement = this._uiElementsMap[key];
            uiElement.setValidation(
                this._validationFactory.getElementValidation(this.ngFormGroup, uiElement)
            );
        }

        for (const key in this._uiGroupElementsMap) {
            const groupUiElement = this._uiGroupElementsMap[key];
            groupUiElement.setValidation(
                this._validationFactory.getElementValidation(this.ngFormGroup, groupUiElement)
            );
        }
    }

    private updateElementsUsingLinks(): boolean {
        if (!this._linkDefinitions) {
            return false;
        }

        const formValue = this.ngFormGroup.getRawValue();
        let elementUpdated = false;
        for (const elName in this._linkDefinitions) {
            const link = this._linkDefinitions[elName];

            const element = this._uiGroupElementsMap[elName] || this._uiElementsMap[elName];
            if (this.reEvaluateElement(elName, formValue, element, link)) {
                elementUpdated = true;
            }
        }

        return elementUpdated;
    }

    private reEvaluateElement(elName: string,
                              formValue: any,
                              element: BaseElement<any>,
                              link: IConfigurationChangeDescription): boolean {
        if (!formValue) {
            return false;
        }
        const newElement = this.getNewElementProps(elName, element, link, formValue);

        switch (newElement.type) {
            case GROUP_TYPES.matCard:
            case GROUP_TYPES.ngtCard:
            case GROUP_TYPES.matExpansionPane:
                return this.updateGroupUiElement(newElement, element, elName);
            default:
                return this.updateUiElement(newElement, element, elName);
        }
    }

    private updateGroupUiElement(newElement: Dictionary<any>, element: BaseElement<any>, elName: string): boolean {
        const groupElement = new GroupUiElement(newElement);
        if (groupElement.isEqual(element)) {
            return false;
        }

        groupElement.attachControl(!element ? new FormGroup({}) : element.getControl());
        groupElement.setValidation(
            this._validationFactory.getElementValidation(
                this.ngFormGroup,
                groupElement
            )
        );
        groupElement.validateIfTouched(false);
        this._uiGroupElementsMap[elName] = groupElement;
        return true;
    }

    private updateUiElement(newElement: Dictionary<any>, element: BaseElement<any>, elName: string): boolean {
        const uiElement = new UiElement(newElement);
        if (uiElement.isEqual(element)) {
            return false;
        }

        uiElement.attachControl(!element ? new FormGroup({}) : element.getControl());
        uiElement.setValidation(
            this._validationFactory.getElementValidation(
                this.ngFormGroup,
                uiElement
            )
        );
        uiElement.validateIfTouched(false);
        this._uiElementsMap[elName] = uiElement;
        return true;
    }

    private markAsTouched(elementsMap: Dictionary<BaseElement<AbstractControl>>, touchedMap: Dictionary<boolean>) {
        for (const key in touchedMap) {
            if (!elementsMap[key] || !elementsMap[key].getControl()) {
                continue;
            }
            const control = elementsMap[key].getControl();

            touchedMap[key]
                ? control.markAsTouched({onlySelf: true})
                : control.markAsUntouched({onlySelf: true});
        }

        this.ngFormGroup.updateValueAndValidity({onlySelf: false, emitEvent: false});
    }

    private getNewElementProps(elName: string, element: BaseElement<any>, link: IConfigurationChangeDescription, formValue: any) {
        let newElement: Dictionary<any> = {
            name: elName,
            ...utils.cloneDeep<Dictionary<any>>(element ? element.getOriginal() : {}),
            ...link.defaultConfig
        };

        const activeLink = link.configChangesMap
            .find(v => v.expectedValue === utils.findValueByKey(formValue, v.linkedElement));

        if (activeLink) {
            newElement = {
                ...newElement,
                ...activeLink.newConfig
            };
        }
        return newElement;
    }

    private getInMemoryLayout(): ILayoutViewModel {
        this.cleanupFormControls(this.ngFormGroup);

        const inMemoryLayout: ILayoutViewModel = [];
        this.layoutModel.forEach(value => {
            const group = this.getGroupUiElement(value.group);
            const layoutElement = {
                group: group,
                lines: this.getLineElementsMatrix(group, value.lines)
            };

            inMemoryLayout.push(layoutElement);
        });
        this.ngFormGroup.updateValueAndValidity({onlySelf: true, emitEvent: false});
        return inMemoryLayout;
    }

    private cleanupFormControls(ngFormGroup: FormGroup) {
        if (!ngFormGroup ||
            !ngFormGroup.controls) {
            return;
        }

        const oldUpdateValue = this.ngFormGroup.updateValueAndValidity.bind(this.ngFormGroup);
        this.ngFormGroup.updateValueAndValidity = () => {
            oldUpdateValue({onlySelf: false, emitEvent: false});
        };
        for (const key in ngFormGroup.controls) {
            if (ngFormGroup[key] instanceof FormGroup) {
                this.cleanupFormControls(ngFormGroup[key]);
            }
            this.ngFormGroup.removeControl(key);
        }
        this.ngFormGroup.updateValueAndValidity = oldUpdateValue;
    }

    private getLineElementsMatrix(group: GroupUiElement, lines: string[][]): UiElement[][] {
        if (!utils.isArray(lines)) {
            return [];
        }

        const formToAttach: FormGroup = group ? group.getControl() as FormGroup : this.ngFormGroup;
        // formToAttach.updateValueAndValidity.bind(formToAttach, {emitEvent: false});

        const elementsMatrix: UiElement[][] = [];
        let arrayToRet: UiElement[] = [];
        lines.forEach(line => {
            arrayToRet = [];
            line.forEach(uiElementName => {
                const uiElement = this.getUiElement(uiElementName);
                formToAttach.removeControl(uiElement.name);
                formToAttach.addControl(uiElement.name, uiElement.getControl());
                arrayToRet.push(uiElement);
            });

            if (arrayToRet.length > 0) {
                elementsMatrix.push(arrayToRet);
            }
        });

        if (group && group.getControl()) {
            this.ngFormGroup.removeControl(group.name);
            this.ngFormGroup.addControl(group.name, formToAttach);
        }

        return elementsMatrix;
    }

    private getTouchedFromElements(baseElements: Dictionary<BaseElement<AbstractControl>>): Dictionary<boolean> {
        const touchedMap = {};
        baseElements = baseElements || {};
        for (const key in baseElements) {
            if (baseElements[key] && baseElements[key].getControl()) {
                touchedMap[key] = baseElements[key].getControl().touched;
            }
        }
        return touchedMap;
    }

    private getUiElement(elementName: string): UiElement {
        if (this._uiElementsMap[elementName]) {
            return this._uiElementsMap[elementName];
        }

        return null;
    }

    private getGroupUiElement(elementName: string): GroupUiElement {
        if (this._uiGroupElementsMap[elementName]) {
            return this._uiGroupElementsMap[elementName];
        }
        return null;
    }
}
