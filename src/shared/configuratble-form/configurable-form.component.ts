import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IFormConfig, IElementConfig, Dictionary, IMappedFormConfig } from './configurable-form.interfaces';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'ngt-configurable-form',
    templateUrl: 'configurable-form.html',
    styleUrls: ['./configurable-form.scss'],
    encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurableFormComponent {
    @Input()
    set formConfig(config$: Observable<IFormConfig>) {
        this.subscribeToConfig(config$);
    }

    renderComponentDom: BehaviorSubject<boolean> = new BehaviorSubject(false);
    formStaticConfig: IFormConfig = null;
    ngFormGroup: FormGroup = null;
    flattenConfigRef: Map<string, IElementConfig> = new Map<string, IElementConfig>();

    private _configSubscription$: Subscription;

    constructor() {
    }

    handleSubmit() {

    }

    private subscribeToConfig(config$: Observable<IFormConfig>) {
        if (this._configSubscription$) {
            this._configSubscription$.unsubscribe();
        }

        if (!(config$ instanceof Observable)) {
            this.renderComponentDom.next(false);
            this.setConfig(this.flattenElementsConfig(config$));
            return;
        }

        this._configSubscription$ = config$
            .do(() => this.renderComponentDom.next(false))
            .map((v: IFormConfig) => this.flattenElementsConfig(v))
            .subscribe(transformed => {
                this.setConfig(transformed);
            });
    }

    private flattenElementsConfig(config: IFormConfig): IMappedFormConfig {
        this.flattenConfigRef = new Map<string, IElementConfig>();
        const ngFormControls: Dictionary<FormControl> = {};

        if (!config || !Array.isArray(config.groupElements)) {
            return;
        }
        config.groupElements.forEach(group => {
            if (!group || !Array.isArray(group.elements)) {
                return;
            }

            group.elements.forEach(elem => {
                elem.elementsOnLine.forEach(lineElem => {
                    ngFormControls[lineElem.name] = new FormControl();
                    this.flattenConfigRef.set(lineElem.name, lineElem);
                });
            });
        });

        return {
            formConfig: config,
            ngFormControls: ngFormControls
        };
    }

    private setConfig(transformed: IMappedFormConfig) {
        this.formStaticConfig = transformed.formConfig;
        this.ngFormGroup = new FormGroup(transformed.ngFormControls);
        this.renderComponentDom.next(true);
    }
}
