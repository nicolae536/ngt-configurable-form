import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatFormFieldModule, MatInputModule, MatIconModule, MatRadioModule, MatCheckboxModule, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatDatepickerModule, MatAutocompleteModule
} from '@angular/material';

import { ElementWrapperComponent } from './element-wrapper.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        MatAutocompleteModule
    ],
    exports: [ElementWrapperComponent],
    declarations: [ElementWrapperComponent],
    providers: [],
})
export class ElementWrapperComponentModule {
}
