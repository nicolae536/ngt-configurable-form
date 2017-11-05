import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule, MatCardModule } from '@angular/material';
import { FormElementsComponentModule } from '../form-elements/form-elements.module';

import { LayoutDrawerComponent } from './layout-drawer.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatExpansionModule,
        MatCardModule,
        FormElementsComponentModule
    ],
    exports: [LayoutDrawerComponent],
    declarations: [LayoutDrawerComponent],
    providers: [],
})
export class LayoutDrawerModule {
}
