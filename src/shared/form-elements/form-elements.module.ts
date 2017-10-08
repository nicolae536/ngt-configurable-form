import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatRadioModule, MatCheckboxModule, MatSlideToggleModule, MatInputModule } from '@angular/material';

import { FormElementsComponent } from './form-elements.component';

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
        MatSlideToggleModule
    ],
    exports: [FormElementsComponent],
    declarations: [FormElementsComponent],
    providers: [],
})
export class FormElementsComponentModule {
}
