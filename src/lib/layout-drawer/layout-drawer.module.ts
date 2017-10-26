import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule, MatCardModule } from '@angular/material';
import { FormElementsComponentModule } from '../form-elements/form-elements.module';
import { ExpansionPanelToggleDirective } from './expansion-panel-toggle/expansion-panel-toggle.directive';

import { LayoutDrawerComponent } from './layout-drawer.component';

@NgModule({
    imports: [
        CommonModule,
        MatExpansionModule,
        MatCardModule,
        FormElementsComponentModule
    ],
    exports: [LayoutDrawerComponent],
    declarations: [LayoutDrawerComponent, ExpansionPanelToggleDirective],
    providers: [],
})
export class LayoutDrawerModule {
}
