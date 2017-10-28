import {
    Component, ViewEncapsulation, Input, HostBinding, OnDestroy, Output, EventEmitter, HostListener, ChangeDetectionStrategy
} from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { IFormConfig, IGroupElementConfig } from '../models/groups.config.interfaces';
import { NgtFormSchema } from '../models/ngt-form-schema';
import { Dictionary } from '../models/shared.interfaces';
import { utils } from '../models/utils';
import { ConfigurableFormService } from './configurable-form.service';

@Component({
    selector: 'ngt-configurable-form',
    templateUrl: 'configurable-form.html',
    styleUrls: ['./configurable-form.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurableFormComponent implements OnDestroy {
    @HostBinding('class.ngt-component') isNgtComponent = true;

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
        this.updateFormValues(values);
    }

    @Input()
    set formConfig(config: IFormConfig) {
        this.setFormConfig(config);
    }

    @Output() onValueChange: EventEmitter<Dictionary<any>> = new EventEmitter<Dictionary<any>>();
    @Output() onConfigurationChange: EventEmitter<IFormConfig> = new EventEmitter<IFormConfig>();
    @Output() onValidityMapChange: EventEmitter<Dictionary<boolean>> = new EventEmitter<Dictionary<boolean>>();
    @Output() onValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    formSchema: NgtFormSchema;

    // ngFormGroup: FormGroup = null;
    // flattenConfigRef: Map<string, IElementConfig | IGroupElementConfig> = new Map<string, IElementConfig | IGroupElementConfig>();
    outsideSharedData: Dictionary<any>;
    outsideDataProviders: Dictionary<Observable<any>>;
    outsideDataListeners: Dictionary<Subject<any>>;

    private _valueChanges$: Subscription;
    private _lastValueFromParent: Object;
    private _isBrowserEvent: boolean;

    constructor(private _configurableForm: ConfigurableFormService) {
    }

    ngOnDestroy(): void {
        if (this._valueChanges$) {
            this._valueChanges$.unsubscribe();
        }
    }

    handleTogglePanel(event: { rowConfig: IGroupElementConfig, isExpanded: boolean }) {
        this._isBrowserEvent = true;
        event.rowConfig.isPanelOpened = event.isExpanded;
        // this.onConfigurationChange.emit(this.renderedFormStaticConfig.value);
    }

    @HostListener('click', ['$event'])
    @HostListener('keydown', ['$event'])
    @HostListener('keyup', ['$event'])
    @HostListener('keypress', ['$event'])
    @HostListener('paste', ['$event'])
    handleEvent(event) {
        this._isBrowserEvent = true;
    }

    private setFormConfig(config: IFormConfig) {
        if (!config) {
            return;
        }

        this.formSchema = this._configurableForm.parseConfiguration(config, this._lastValueFromParent);
        this.setValueChangeSubscription();
    }

    private updateFormValues(values: Object) {
        if (!values) {
            return;
        }

        this._lastValueFromParent = values;
        this.patchFormValue(values);
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
            .do(() => this.formSchema.changeLayoutIfNeeded())
            .map(v => this.formSchema.getValue())
            .subscribe(value => {
                // console.info("Values change", JSON.parse(JSON.stringify(value.formValue)));
                this.onValueChange.emit(value);
                // this.onValidityMapChange.emit(value.formValidity);
                // this.onValidityChange.emit(this.ngFormGroup.valid);
                this.emitValueToListenersMap(value);
            });
    }

    // private emitNewConfigIfValid(newConfig) {
    //     if (!newConfig) {
    //         return;
    //     }
    //
    //     this.renderedFormStaticConfig.next(newConfig);
    //     this.onConfigurationChange.emit(newConfig);
    // }

    private checkBrowserEvent(): boolean {
        if (this._isBrowserEvent) {
            setTimeout(() => this._isBrowserEvent = false);
            return true;
        }

        return false;
    }

    private emitValueToListenersMap(formValue: Dictionary<any>) {
        if (!this.outsideDataListeners) {
            return;
        }

        for (const key in this.outsideDataListeners) {
            if (!this._lastValueFromParent ||
                formValue[key] !== this._lastValueFromParent[key]) {
                this.outsideDataListeners[key].next(formValue[key]);
            }
        }

        this._lastValueFromParent = formValue;
    }
}
