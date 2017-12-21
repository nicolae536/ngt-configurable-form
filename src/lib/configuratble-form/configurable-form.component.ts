import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { GroupExpandChangeEvent } from '../models/group-ui-element';
import { IFormConfig } from '../models/groups.config.interfaces';
import { NgtFormSchemaController } from '../models/ngt-form-schema';
import { Dictionary } from '../models/shared.interfaces';
import { utils } from '../models/utils';
import { ValidationFactoryService } from './validation-factory.service';

@Component({
    selector: 'ngt-configurable-form',
    templateUrl: 'configurable-form.html',
    styleUrls: ['./configurable-form.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurableFormComponent implements OnDestroy {
    @HostBinding('class.ngt-component') isNgtComponent = true;
    @Input() logging: boolean = false;

    // Not used planned for connecting data from outside
    @Input()
    set sharedData(data: Dictionary<any>) {
        this.outsideSharedData = data;
    }

    @Input()
    set fieldsDataProviders(data: Dictionary<Observable<any>>) {
        this.outsideDataProviders = data;
    }

    @Input()
    set fieldsListenersMap(listeners: Dictionary<Subject<any>>) {
        this.outsideDataListeners = listeners;
    }

    @Input()
    set updateValues(values: Object) {
        this.applyValueToSchema(values);
    }

    @Input()
    set formConfig(config: IFormConfig) {
        this.setFormConfig(config);
    }

    @Input()
    set expandedGroups(groups: Dictionary<boolean>) {
        this.setExpandedGroups(groups);
    }

    @Input()
    set touchedControls(touchedMap: Dictionary<boolean>) {
        this.setTouchedControls(touchedMap);
    }

    @Output() onValueChange: EventEmitter<Dictionary<any>> = new EventEmitter<Dictionary<any>>();
    @Output() onValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() onExpandedPanesChange: EventEmitter<Dictionary<boolean>> = new EventEmitter<Dictionary<boolean>>();
    @Output() onTouchedChange: EventEmitter<Dictionary<boolean>> = new EventEmitter<Dictionary<boolean>>();

    formSchema: NgtFormSchemaController;
    outsideSharedData: Dictionary<any>;
    outsideDataProviders: Dictionary<Observable<any>>;
    outsideDataListeners: Dictionary<Subject<any>>;

    private _valueChanges$: Subscription;
    private _lastValueFromParent: Object;
    private _expandedGroups: Dictionary<boolean> = {};
    private _touchedControlsMap: Dictionary<boolean> = {};
    private _lastEmittedModel: Object;

    constructor(private _validationFactory: ValidationFactoryService) {
    }

    ngOnDestroy(): void {
        if (this._valueChanges$) {
            this._valueChanges$.unsubscribe();
        }
    }

    handleTogglePanel(event: GroupExpandChangeEvent) {
        this._expandedGroups[event.name] = event.isExpanded;
        this.onExpandedPanesChange.emit({...this._expandedGroups});
    }

    getValidMap() {
        if (!this.formSchema || !this.formSchema.ngFormGroup) {
            return;
        }

        const validMap = {};
        for (const key in this.formSchema.ngFormGroup.controls) {
            const control = this.formSchema.ngFormGroup.get(key);
            validMap[key] = {isValid: control.valid};

            if (control.hasOwnProperty('controls')) {
                validMap[key].controls = {};

                for (const cN in control['controls']) {
                    validMap[key].controls[cN] = control['controls'][cN].valid;
                }
            }
        }
        return validMap;
    }

    private setFormConfig(config: IFormConfig) {
        if (!config) {
            return;
        }

        if (this.formSchema) {
            this.formSchema.destroy();
        }
        this.formSchema = new NgtFormSchemaController(config, this._validationFactory);
        this.applyValueToSchema(this._lastValueFromParent);
        this.applyGroupsSettingsToSchema(this._expandedGroups);
        this.applyTouchedSettingsToSchema(this._touchedControlsMap);
        this.setValueChangeSubscription();
        this.setValidationChangeSubscription();
    }

    private patchFormValue(values: Object) {
        if (!this.formSchema || !values) {
            return;
        }

        if (utils.areEqual(this.formSchema.getValue(), values)) {
            return;
        }

        this.formSchema.setValueWithLayoutChange(values);
    }

    private setValueChangeSubscription() {
        if (this._valueChanges$) {
            this._valueChanges$.unsubscribe();
        }

        this._valueChanges$ = this.formSchema.ngFormGroup
            .valueChanges
            .debounceTime(0)
            .map(() => this.formSchema.changeLayoutIfNeeded())
            .map(v => this.formSchema.getValue())
            .filter(v => !utils.areEqual(this._lastEmittedModel, v))
            .subscribe(value => {
                this._lastEmittedModel = value;
                this.onValueChange.emit(value);
                this.onTouchedChange.emit(this.formSchema.getTouchedMap());
                this.formSchema.validityChange$.next(this.formSchema.ngFormGroup.valid);
                this.emitValueToListenersMap(value);
            });
    }

    private emitValueToListenersMap(formValue: Dictionary<any>) {
        if (!this.outsideDataListeners) {
            return;
        }

        for (const key in this.outsideDataListeners) {
            const oldKeyValue = this._lastValueFromParent
                ? utils.findValueByKey(this._lastValueFromParent, key)
                : this._lastValueFromParent;
            const newKeyValue = formValue
                ? utils.findValueByKey(formValue, key)
                : formValue;

            if (oldKeyValue !== newKeyValue) {
                this.outsideDataListeners[key].next(newKeyValue);
            }
        }

        this._lastValueFromParent = formValue;
    }

    private setExpandedGroups(groups: Dictionary<boolean>) {
        this._expandedGroups = groups || {};
        this.applyGroupsSettingsToSchema(groups);
    }

    private setTouchedControls(touchedMap: Dictionary<boolean>) {
        this._touchedControlsMap = touchedMap || {};
        this.applyTouchedSettingsToSchema(touchedMap);
    }

    private applyValueToSchema(values: Object) {
        this._lastValueFromParent = values || {};
        this.patchFormValue(values);
    }

    private applyGroupsSettingsToSchema(groups: Dictionary<boolean>) {
        if (!this.formSchema || !groups) {
            return;
        }

        this.formSchema.setExpandedGroups(groups);
    }

    private applyTouchedSettingsToSchema(touchedMap: Dictionary<boolean>) {
        if (!this.formSchema || !touchedMap) {
            return;
        }

        this.formSchema.setTouchedControls(touchedMap);
    }

    private setValidationChangeSubscription() {
        this.formSchema
            .validityChange$
            .debounceTime(0)
            .subscribe(value => {
                this.onValidityChange.emit(value);
            });
    }
}
