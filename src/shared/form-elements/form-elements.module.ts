import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ElementWrapperComponentModule } from '../element-wrapper/element-wrapper.module';

import { FormElementsComponent } from './form-elements.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ElementWrapperComponentModule
    ],
    exports: [FormElementsComponent],
    declarations: [FormElementsComponent],
    providers: [],
})
export class FormElementsComponentModule {
}
