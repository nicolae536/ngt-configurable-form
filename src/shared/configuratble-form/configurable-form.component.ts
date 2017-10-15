import { Component, ViewEncapsulation, Input, HostBinding, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { IFormConfig, IElementConfig, IMappedFormConfig, Dictionary } from './configurable-form.interfaces';
import { ConfigurableFormService, IElementChangePayload } from './configurable-form.service';

@Component({
    selector: 'ngt-configurable-form',
    templateUrl: 'configurable-form.html',
    styleUrls: ['./configurable-form.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurableFormComponent implements OnDestroy {
    @HostBinding('class.ngt-component') isNgtComponent = true;

    @Input()
    set formConfig(config$: Observable<IFormConfig>) {
        this.subscribeToConfig(config$);
    }

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
        this.outsideDataListener = listeners;
    }

    @Input()
    set updateValues(values: Object) {
        this.updateFormValues(values);
    }

    @Output() onValueChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() onConfigurationChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() onValidityChange: EventEmitter<any> = new EventEmitter<any>();

    renderedFormStaticConfig: BehaviorSubject<IFormConfig> = new BehaviorSubject(null);

    ngFormGroup: FormGroup = null;
    flattenConfigRef: Map<string, IElementConfig> = new Map<string, IElementConfig>();
    outsideSharedData: Dictionary<any>;
    outsideDataProviders: Dictionary<Observable<any>>;
    outsideDataListener: Dictionary<Subject<any>>;

    private _configSubscription$: Subscription;
    private _subscriptions$: Subscription[] = [];
    private _lastValueFromParent: Object;

    constructor(private _configurableForm: ConfigurableFormService) {
    }

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }

    handleSubmit() {

    }

    handleConfigurationChange(change: IElementChangePayload) {
        const newConfiguration = this._configurableForm
            .doConfigurationChange(change, this.renderedFormStaticConfig.value, this.flattenConfigRef, this.ngFormGroup);
        this.renderedFormStaticConfig.next(newConfiguration);
    }

    private subscribeToConfig(config$: Observable<IFormConfig>) {
        if (this._subscriptions$) {
            this._subscriptions$.forEach(v => v.unsubscribe());
        }

        if (!(config$ instanceof Observable)) {
            this.setFormConfig(this._configurableForm.parseConfiguration(config$));
            return;
        }

        this._subscriptions$.push(config$
            .map((config: IFormConfig) => this._configurableForm.parseConfiguration(config))
            .subscribe(transformed => {
                this.setFormConfig(transformed);
            }));
    }

    private setFormConfig(transformed: IMappedFormConfig) {
        this.flattenConfigRef = transformed.flattenConfigRef;
        this.ngFormGroup = transformed.ngFormControls;
        this.patchFormValue(this._lastValueFromParent);
        this.renderedFormStaticConfig.next(transformed.formConfig);
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
        if (!this.ngFormGroup || !values) {
            return;
        }

        this.ngFormGroup.patchValue(values, {
            onlySelf: true,
            emitEvent: false
        });
    }

    private setValueChangeSubscription() {
        this._subscriptions$.push(
            this.ngFormGroup
                .valueChanges
                .debounceTime(0)
                .map(v => this._configurableForm.changeConfigurationIfNeeded(
                    this.renderedFormStaticConfig.value,
                    this.flattenConfigRef,
                    this.ngFormGroup
                ))
                .do((configChanged) => {
                    if (configChanged) {
                        console.info("Configuration change", JSON.parse(JSON.stringify(configChanged)));
                        this.renderedFormStaticConfig.next(configChanged);
                        this.onConfigurationChange.emit(configChanged);
                    }
                })
                .map(v => this._configurableForm.unWrapFormValue(this.ngFormGroup))
                .subscribe(value => {
                    this.onValueChange.emit(value.formValue);
                    this.onValidityChange.emit(value.formValidity);
                })
        );
    }
}
