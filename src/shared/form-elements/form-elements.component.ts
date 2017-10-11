import { Component, Input, ViewEncapsulation, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { IElementConfig, Dictionary } from '../configuratble-form/configurable-form.interfaces';

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

    constructor() {
    }
}
