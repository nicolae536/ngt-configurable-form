import { Component, ViewEncapsulation, Input, HostBinding, OnDestroy, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { IFormConfig, IElementConfig, IMappedFormConfig, Dictionary, IGroupElementsConfig } from './configurable-form.interfaces';
import { ConfigurableFormService } from './configurable-form.service';
import { ConfigurationChangeFactoryService } from './configuration-change-factory.service';

@Component({
    selector: 'ngt-configurable-form',
    templateUrl: 'configurable-form.html',
    styleUrls: ['./configurable-form.scss'],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurableFormComponent implements OnDestroy {
    @HostBinding('class.ngt-component') isNgtComponent = true;

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

    @Input()
    set formConfig(config$: Observable<IFormConfig> | IFormConfig) {
        this.subscribeToConfig(config$);
    }

    @Output() onValueChange: EventEmitter<Dictionary<any>> = new EventEmitter<Dictionary<any>>();
    @Output() onConfigurationChange: EventEmitter<IFormConfig> = new EventEmitter<IFormConfig>();
    @Output() onValidityMapChange: EventEmitter<Dictionary<boolean>> = new EventEmitter<Dictionary<boolean>>();
    @Output() onValidityChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    renderedFormStaticConfig: BehaviorSubject<IFormConfig> = new BehaviorSubject(null);

    ngFormGroup: FormGroup = null;
    flattenConfigRef: Map<string, IElementConfig> = new Map<string, IElementConfig>();
    outsideSharedData: Dictionary<any>;
    outsideDataProviders: Dictionary<Observable<any>>;
    outsideDataListener: Dictionary<Subject<any>>;

    private _subscriptions$: Subscription[] = [];
    private _lastValueFromParent: Object;
    private _isBrowserEvent: boolean;

    constructor(private _configurableForm: ConfigurableFormService,
                private _configurationChangeFactory: ConfigurationChangeFactoryService) {
    }

    ngOnDestroy(): void {
        this._subscriptions$.forEach(sub => sub.unsubscribe());
    }

    handleTogglePanel(rowConfig: IGroupElementsConfig, event) {
        this._isBrowserEvent = true;
        rowConfig.isPanelOpened = event;
        this.onConfigurationChange.emit(this.renderedFormStaticConfig.value);
    }

    @HostListener('click', ['$event'])
    @HostListener('keydown', ['$event'])
    @HostListener('keyup', ['$event'])
    @HostListener('keypress', ['$event'])
    @HostListener('paste', ['$event'])
    handleEvent(event) {
        this._isBrowserEvent = true;
    }

    private subscribeToConfig(config$: Observable<IFormConfig> | IFormConfig) {
        if (!config$ || this.checkBrowserEvent()) {
            return;
        }

        if (this._subscriptions$) {
            this._subscriptions$.forEach(v => v.unsubscribe());
        }

        if (!(config$ instanceof Observable)) {
            this.setFormConfig(this._configurableForm.parseConfiguration(config$, this._lastValueFromParent));
            return;
        }

        this._subscriptions$.push(config$
            .map((config: IFormConfig) => this._configurableForm.parseConfiguration(config, this._lastValueFromParent))
            .subscribe(transformed => {
                this.setFormConfig(transformed);
            }));
    }

    private setFormConfig(transformed: IMappedFormConfig) {
        this.flattenConfigRef = transformed.flattenConfigRef;
        this.ngFormGroup = transformed.ngFormControls;
        this.renderedFormStaticConfig.next(transformed.formConfig);
        this.setValueChangeSubscription();
    }

    private updateFormValues(values: Object) {
        if (!values) {
            return;
        }

        this._lastValueFromParent = values;

        if (this.checkBrowserEvent()) {
            return;
        }
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
        let configChanged = this._configurationChangeFactory.stabilizeConfigurationStructure(
            this.renderedFormStaticConfig.value,
            this.flattenConfigRef,
            this.ngFormGroup
        );
        if (configChanged) {
            this.renderedFormStaticConfig.next(configChanged);
        }
    }

    private setValueChangeSubscription() {
        this._subscriptions$.push(
            this.ngFormGroup
                .valueChanges
                .debounceTime(0)
                .do(() => this._isBrowserEvent = true)
                .map(v => this._configurationChangeFactory.stabilizeConfigurationStructure(
                    this.renderedFormStaticConfig.value,
                    this.flattenConfigRef,
                    this.ngFormGroup
                ))
                .do((newConfig) => this.emitNewConfigIfValid(newConfig))
                .map(v => this._configurableForm.unWrapFormValue(this.ngFormGroup))
                .subscribe(value => {
                    // console.info("Values change", JSON.parse(JSON.stringify(value.formValue)));
                    this.onValueChange.emit(value.formValue);
                    this.onValidityMapChange.emit(value.formValidity);
                    this.onValidityChange.emit(this.ngFormGroup.valid);
                })
        )
        ;
    }

    private emitNewConfigIfValid(newConfig) {
        if (!newConfig) {
            return;
        }

        this.renderedFormStaticConfig.next(newConfig);
        this.onConfigurationChange.emit(newConfig);
    }

    private checkBrowserEvent(): boolean {
        if (this._isBrowserEvent) {
            setTimeout(() => this._isBrowserEvent = false);
            return true;
        }

        return false;
    }
}
