import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { IFormConfig, IGroupElementConfig } from '../models/groups.config.interfaces';
import { Dictionary } from '../models/shared.interfaces';

@Component({
    moduleId: module.id,
    selector: 'ngt-layout-drawer',
    templateUrl: './layout-drawer.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutDrawerComponent {
    @Input() outsideSharedData: Dictionary<any>;
    @Input() outsideDataProviders: Dictionary<Observable<any>>;
    @Input() parentFormGroup: FormGroup;
    @Input() formStaticConfig: IFormConfig;
    @Output() onPanelToggle: EventEmitter<{ rowConfig: IGroupElementConfig, isExpanded: boolean }> =
        new EventEmitter<{ rowConfig: IGroupElementConfig, isExpanded: boolean }>();

    handleTogglePanel(rowConfig, isExpanded) {
        this.onPanelToggle.emit({rowConfig, isExpanded});
    }
}
