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

interface ILayoutChange {
    ngFormGroup: FormGroup;
    activeLayout?: any;
}

export class NgtFormSchema {
    name: string;
    ngFormGroup: FormGroup;
    attachedLayout: any;
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
        this.attachedLayout = this.getNewLayout();
        // TODO Consider letting angular to draw the layout and used the main control group for changes
        /** TODO flow valueChanges$ -> check links for element recompilation (recompile only if this is needed)
         *  TODO                    -> create a new layout
         *  TODO                    -> do reference checks for the new Layout
         *  TODO                    -> if references have changed rerender the changed nodes
         *  TODO consequences       -> OnPush must depend on inputs which are in layout references and rerender the dom accordingly
         */

        // TODO add ngControls to elements
        // TODO add rx BS which supports hot value changes for the main element group
        // TODO find a way to keep the ngControls touched/disabled state
        // TODO The ngControls must support hot reloading of validation without triggering changes
        // TODO Create visible layout -> the layout should not reRender unless this is needed
    }

    getValue(): Object {
        return this.ngFormGroup.getRawValue();
    }

    setValueWithLayoutChange(value: any) {
        if (!value) {
            return;
        }

        this.ngFormGroup.patchValue(
            value,
            {onlySelf: true, emitEvent: false}
        );

        if (!this.changeLayoutIfNeeded()) {
            this.layoutUpdateStatus$.next(true);
        }
    }

    changeLayoutIfNeeded() {
        if (!this.updateElementsUsingLinks()) {
            return;
        }
        // If I uncomment this line when I generate a new layout
        // this line will update all dom nodes
        // Recheck after https://github.com/angular/angular/issues/20026 is cleared
        // TODO 1.Bug report for all domes rerendered when this reference changed
        // this.attachedLayout = this.getNewLayout();
        // this.layoutUpdateStatus$.next(
        //     // true
        // );

        // This line updates only changed references
        // this.attachedLayout = this.getNewLayout();
        // layoutUpdateStatus$ is sending an events to the components which should be
        // marked for check why do I need this if I create new references with onOush strategy ?
        // it should update automatically because the reference has changed
        // TODO 2.Bug report for why do I need to mark for check when i'm changing only references with OnPush
        const wasLayoutMerged = this.mergeLayouts(this.attachedLayout, this.getNewLayout());
        this.layoutUpdateStatus$.next(
            wasLayoutMerged
        );
        return wasLayoutMerged;
    }

    getUiElement(elementName: string): UiElement {
        if (this._uiElementsMap[elementName]) {
            return this._uiElementsMap[elementName];
        }

        return null;
    }

    getGroupUiElement(elementName: string): GroupUiElement {
        if (this._uiGroupElementsMap[elementName]) {
            return this._uiGroupElementsMap[elementName];
        }
        return null;
    }

    updateElementsUsingLinks(): boolean {
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

    setExpandedGroups(groups: Dictionary<boolean>) {
        if (utils.isNullOrUndefined(groups)) {
            return;
        }

        let wasUpdated = false;
        for (const key in this._uiGroupElementsMap) {
            this._uiGroupElementsMap[key].isExpanded = !!groups[key];
            wasUpdated = true;
        }
        this.layoutUpdateStatus$.next(wasUpdated);
    }

    setTouchedControls(touchedMap: Dictionary<boolean>) {
        if (utils.isNullOrUndefined(touchedMap)) {
            return;
        }

        this.markAsTouched(this._uiElementsMap, touchedMap);
        this.markAsTouched(this._uiGroupElementsMap, touchedMap);
    }

    destroy() {
        this.ngFormGroup.reset({}, {
            onlySelf: true,
            emitEvent: false
        });
        this.attachedLayout = null;
        this.layoutUpdateStatus$.next(true);
        this.layoutUpdateStatus$.complete();
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

    private getNewLayout(): ILayoutViewModel {
        this.cleanupFormControls(this.ngFormGroup);

        const newModel: ILayoutViewModel = [];
        this.layoutModel.forEach(value => {
            const group = this.getGroupUiElement(value.group);
            if (group && group.hidden) {
                return;
            }

            const layoutElement = {
                group: group,
                lines: this.getLineElementsMatrix(group, value.lines)
            };

            newModel.push(layoutElement);
        });
        this.ngFormGroup.updateValueAndValidity({onlySelf: true, emitEvent: false});
        return newModel;
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
                if (!uiElement ||
                    uiElement.hidden) {
                    return;
                }

                const oldUpdateValue = formToAttach.updateValueAndValidity.bind(formToAttach);
                formToAttach.updateValueAndValidity = () => {
                    oldUpdateValue({onlySelf: false, emitEvent: false});
                };
                formToAttach.removeControl(uiElement.name);
                // formToAttach.updateValueAndValidity = formToAttach.updateValueAndValidity.bind(formToAttach, {emitEvent: false});
                formToAttach.addControl(uiElement.name, uiElement.getControl());
                formToAttach.updateValueAndValidity = oldUpdateValue;
                arrayToRet.push(uiElement);
            });

            if (arrayToRet.length > 0) {
                elementsMatrix.push(arrayToRet);
            }
        });

        if (group && group.getControl()) {
            const oldUpdateValue = this.ngFormGroup.updateValueAndValidity.bind(this.ngFormGroup);
            this.ngFormGroup.updateValueAndValidity = () => {
                oldUpdateValue({onlySelf: false, emitEvent: false});
            };
            this.ngFormGroup.removeControl(group.name);
            this.ngFormGroup.addControl(group.name, formToAttach);
            this.ngFormGroup.updateValueAndValidity = oldUpdateValue;
        }

        return elementsMatrix;
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
        groupElement.validateIfTouched();
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
        uiElement.validateIfTouched();
        this._uiElementsMap[elName] = uiElement;
        return true;
    }

    /**
     * Merge two layouts statically
     */
    private mergeLayouts(attachedLayout: ILayoutViewModel, newLayout: ILayoutViewModel): boolean {
        let layoutUpdated: boolean = false;

        for (let idx = 0; idx < newLayout.length; idx++) {
            const uGroup = newLayout[idx];
            const aGroup = attachedLayout[idx];

            if (!aGroup) {
                attachedLayout[idx] = newLayout[idx];
                continue;
            }

            if (uGroup.group !== aGroup.group ||
                uGroup.lines.length !== aGroup.lines.length) {
                // group changed we need to fetch the new values to the dom
                aGroup.group = uGroup.group;
                attachedLayout[idx] = newLayout[idx];
                layoutUpdated = true;
                continue;
            }

            for (let lIdx = 0; lIdx < uGroup.lines.length; lIdx++) {
                const uLine = uGroup.lines[lIdx];
                const aLine = aGroup.lines[lIdx];

                if (uLine.length !== aLine.length) {
                    aGroup.lines[lIdx] = uGroup.lines[lIdx];
                    layoutUpdated = true;
                    continue;
                }

                for (let eIdx = 0; eIdx < uLine.length; eIdx++) {
                    if (uLine[eIdx] !== aLine[eIdx]) {
                        layoutUpdated = true;
                        aLine[eIdx] = uLine[eIdx];
                    }
                }
            }
        }

        if (attachedLayout.length > newLayout.length) {
            attachedLayout.splice(newLayout.length, attachedLayout.length - newLayout.length);
            layoutUpdated = true;
        }

        return layoutUpdated;
    }

    getTouchedMap() {
        return {
            ...this.getTouchedFromElements(this._uiElementsMap),
            ...this.getTouchedFromElements(this._uiGroupElementsMap)
        };
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
}
