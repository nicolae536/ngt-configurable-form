import {
    Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewEncapsulation, OnInit, ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { GROUP_TYPES } from '../models/group-ui-element';
import { IGroupElementConfig, ILayoutViewModel } from '../models/groups.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';

@Component({
    moduleId: module.id,
    selector: 'ngt-layout-drawer',
    templateUrl: './layout-drawer.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutDrawerComponent implements OnInit, OnDestroy {
    @Input() layoutUpdateStatus$: Subject<boolean>;
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;
    @Input() parentFormGroup: FormGroup;
    @Input() formName: string;
    @Input() layout: ILayoutViewModel;
    @Output() onPanelToggle: EventEmitter<{ rowConfig: IGroupElementConfig, isExpanded: boolean }> =
        new EventEmitter<{ rowConfig: IGroupElementConfig, isExpanded: boolean }>();

    groupTypes = GROUP_TYPES;
    private _layoutUpdateTeardown$: Subscription;

    constructor(private _cdRef: ChangeDetectorRef) {
    }

    handleTogglePanel(rowConfig, isExpanded) {
        rowConfig.group.isExpanded = isExpanded;
        this.onPanelToggle.emit({rowConfig, isExpanded});
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
