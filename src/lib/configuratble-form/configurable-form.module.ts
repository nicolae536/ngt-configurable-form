import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material';
import { FormElementsComponentModule } from '../form-elements/form-elements.module';

import { ConfigurableFormComponent } from './configurable-form.component';
import { ConfigurableFormService } from './configurable-form.service';
import { ConfigurationChangeFactoryService } from './configuration-change-factory.service';
import { IValidationFactory } from './validation-factory.interface';
import { ValidationFactoryService } from './validation-factory.service';
import { ExpansionPanelToggleDirective } from '../expansion-panel-toggle/expansion-panel-toggle.directive';

export const VALIDATION_FACTORY = new InjectionToken<IValidationFactory>('Token ngt-configurable-form/validation-factory');

export function _getValidationFactory(): IValidationFactory {
    return null;
}

export function getValidationFactory(validationFactory: IValidationFactory) {
    return new ValidationFactoryService(validationFactory);
}

export function provideForm(validationFactory: () => IValidationFactory): any[] {
    return [
        ConfigurableFormService,
        ConfigurationChangeFactoryService,
        {provide: ValidationFactoryService, useFactory: getValidationFactory, deps: [VALIDATION_FACTORY]},
        {provide: VALIDATION_FACTORY, useFactory: validationFactory || _getValidationFactory}
    ];
}


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatExpansionModule,
        FormElementsComponentModule
    ],
    exports: [ConfigurableFormComponent],
    declarations: [ConfigurableFormComponent, ExpansionPanelToggleDirective],
    providers: [],
})
export class ConfigurableFormComponentModule {
    static forRoot(validationFactory?: () => IValidationFactory): ModuleWithProviders {
        return {
            ngModule: ConfigurableFormComponentModule,
            providers: provideForm(validationFactory)
        };
    }
}
