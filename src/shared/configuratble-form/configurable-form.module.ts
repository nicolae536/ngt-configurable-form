import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material';
import { FormElementsComponentModule } from '../form-elements/form-elements.module';

import { ConfigurableFormComponent } from './configurable-form.component';
import { ConfigurableFormService } from './configurable-form.service';
import { ValidationFactoryService } from './validation-factory.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionModule,
        FormElementsComponentModule
    ],
    exports: [ConfigurableFormComponent],
    declarations: [ConfigurableFormComponent],
    providers: [
        ConfigurableFormService,
        ValidationFactoryService
    ],
})
export class ConfigurableFormComponentModule {
}
