import {
    Component, ChangeDetectionStrategy, Input, Output, EventEmitter, DoCheck, ViewEncapsulation, OnInit, ChangeDetectorRef, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { GROUP_TYPES, GroupExpandChangeEvent } from '../models/group-ui-element';
import { ILayoutViewModel } from '../models/groups.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';

@Component({
    moduleId: module.id,
    selector: 'ngt-layout-drawer',
    templateUrl: './layout-drawer.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutDrawerComponent {
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;
    @Input() parentFormGroup: FormGroup;
    @Input() formName: string;
    @Input() layout: ILayoutViewModel;
    @Output() onPanelToggle: EventEmitter<GroupExpandChangeEvent> = new EventEmitter<GroupExpandChangeEvent>();

    groupTypes = GROUP_TYPES;

    constructor() {
    }

    handleTogglePanel(rowConfig) {
        rowConfig.group.isExpanded = !rowConfig.group.isExpanded;
        this.onPanelToggle.emit({name: rowConfig.group.name, isExpanded: rowConfig.group.isExpanded});
    }
}
