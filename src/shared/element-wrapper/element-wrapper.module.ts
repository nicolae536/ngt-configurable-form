import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MatFormFieldModule, MatInputModule, MatIconModule, MatRadioModule, MatCheckboxModule, MatSlideToggleModule, MatSelectModule,
    MatOptionModule, MatDatepickerModule, MatAutocompleteModule, MatNativeDateModule
} from '@angular/material';
import { FormFieldComponentModule } from '../form-field/form-field.module';

import { ElementWrapperComponent } from './element-wrapper.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FormFieldComponentModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatRadioModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule
    ],
    exports: [ElementWrapperComponent],
    declarations: [ElementWrapperComponent],
    providers: [],
})
export class ElementWrapperComponentModule {
}
