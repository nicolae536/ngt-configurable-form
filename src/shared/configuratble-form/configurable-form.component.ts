import { Component, ViewEncapsulation, Input, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IFormConfig, IElementConfig, IMappedFormConfig, Dictionary } from './configurable-form.interfaces';
import { ConfigurableFormService } from './configurable-form.service';

@Component({
    selector: 'ngt-configurable-form',
    templateUrl: 'configurable-form.html',
    styleUrls: ['./configurable-form.scss'],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurableFormComponent {
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
    set dataProviders(data: Dictionary<Observable<any>>) {
        this.outsideDataProviders = data;
    }

    renderComponentDom: BehaviorSubject<boolean> = new BehaviorSubject(false);
    formStaticConfig: IFormConfig = null;
    ngFormGroup: FormGroup = null;
    flattenConfigRef: Map<string, IElementConfig> = new Map<string, IElementConfig>();
    outsideSharedData: Dictionary<any>;
    outsideDataProviders: Dictionary<Observable<any>>;

    private _configSubscription$: Subscription;

    constructor(private _configurableForm: ConfigurableFormService) {
    }

    handleSubmit() {

    }

    private subscribeToConfig(config$: Observable<IFormConfig>) {
        if (this._configSubscription$) {
            this._configSubscription$.unsubscribe();
        }

        if (!(config$ instanceof Observable)) {
            this.renderComponentDom.next(false);
            this.setFormConfig(this._configurableForm.parseInitialConfig(config$));
            return;
        }

        this._configSubscription$ = config$
            .do(() => this.renderComponentDom.next(false))
            .map((config: IFormConfig) => this._configurableForm.parseInitialConfig(config))
            .subscribe(transformed => {
                this.setFormConfig(transformed);
            });
    }

    private setFormConfig(transformed: IMappedFormConfig) {
        this.flattenConfigRef = transformed.flattenConfigRef;
        this.formStaticConfig = transformed.formConfig;
        this.ngFormGroup = new FormGroup(transformed.ngFormControls);
        this.renderComponentDom.next(true);
    }
}
