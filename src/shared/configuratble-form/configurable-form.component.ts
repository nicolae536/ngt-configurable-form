import { Component, ViewEncapsulation, Input, HostBinding } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { IFormConfig, IElementConfig, Dictionary, IMappedFormConfig } from './configurable-form.interfaces';

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

                    if (lineElem.type === 'select' && !(lineElem.config.options instanceof Observable)) {
                        lineElem.config.options = Observable.of(lineElem.config.options);
                    }
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
