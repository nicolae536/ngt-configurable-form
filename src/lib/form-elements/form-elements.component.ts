import {
    Component, Input, ViewEncapsulation, HostBinding, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, SimpleChanges, OnChanges
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Dictionary } from '../models/shared.interfaces';
import { UiElement } from '../models/ui-element';

@Component({
    selector: 'ngt-form-elements',
    templateUrl: './form-elements.html',
    styleUrls: ['./form-elements.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementsComponent {
    @HostBinding('class.ngt-component') isNgtComponent = true;
    @Input() formName: string;
    @Input() rootFormGroup: FormGroup;
    @Input() parentFormGroup: FormGroup;
    @Input() elements: UiElement[];
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;
}
