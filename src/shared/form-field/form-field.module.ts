import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormFieldComponent } from './form-field.component';

@NgModule({
    imports: [CommonModule],
    exports: [
        FormFieldComponent
    ],
    declarations: [FormFieldComponent],
    providers: [],
})
export class FormFieldComponentModule {
}
