import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
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
export class LayoutDrawerComponent {
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;
    @Input() parentFormGroup: FormGroup;
    @Input() formName: string;
    @Input() layout: ILayoutViewModel;
    @Output() onPanelToggle: EventEmitter<{ rowConfig: IGroupElementConfig, isExpanded: boolean }> =
        new EventEmitter<{ rowConfig: IGroupElementConfig, isExpanded: boolean }>();

    groupTypes = GROUP_TYPES;

    handleTogglePanel(rowConfig, isExpanded) {
        rowConfig.group.isExpanded = isExpanded;
        this.onPanelToggle.emit({rowConfig, isExpanded});
    }
}
