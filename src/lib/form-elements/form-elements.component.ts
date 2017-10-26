import { Component, Input, ViewEncapsulation, HostBinding, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { IElementChangePayload } from '../configuratble-form/configurable-form.interfaces';
import { IElementConfig } from '../models/element.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';

@Component({
    selector: 'ngt-form-elements',
    templateUrl: './form-elements.html',
    styleUrls: ['./form-elements.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementsComponent {
    @HostBinding('class.ngt-component') isNgtComponent = true;
    @Input() formName: boolean;
    @Input() parentFormGroup: FormGroup;
    @Input() elements: IElementConfig[];
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;

    @Output() onConfigurationChange: EventEmitter<IElementChangePayload> = new EventEmitter();

    constructor() {
    }

    handleConfigurationChange(change: IElementChangePayload) {
        this.onConfigurationChange.next(change);
    }
}
