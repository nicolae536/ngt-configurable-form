import {
    Component, Input, ViewEncapsulation, HostBinding, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy
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
export class FormElementsComponent implements OnInit, OnDestroy {
    @HostBinding('class.ngt-component') isNgtComponent = true;
    @Input() layoutUpdateStatus$: Subject<boolean>;
    @Input() formName: boolean;
    @Input() parentFormGroup: FormGroup;
    @Input() elements: UiElement[];
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;

    private _layoutUpdateTeardown$: Subscription;

    constructor(private _cdRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        if (!this.layoutUpdateStatus$) {
            return;
        }

        this._layoutUpdateTeardown$ = this.layoutUpdateStatus$
            .filter(v => v)
            .subscribe(v => this._cdRef.markForCheck());
    }

    ngOnDestroy(): void {
        if (!this._layoutUpdateTeardown$) {
            return;
        }
        this._layoutUpdateTeardown$.unsubscribe();
    }
}
