import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutDrawerModule } from '../layout-drawer/layout-drawer.module';
import '../models/rx-extensions';
import { ConfigurableFormComponent } from './configurable-form.component';
import { IValidationFactory } from './validation-factory.interface';
import { ValidationFactoryService } from './validation-factory.service';

export const VALIDATION_FACTORY = new InjectionToken<IValidationFactory>('Token ngt-configurable-form/validation-factory');

export function _getValidationFactory(): IValidationFactory {
    return null;
}

export function getValidationFactory(validationFactory: IValidationFactory) {
    return new ValidationFactoryService(validationFactory);
}

export function provideForm(validationFactory: () => IValidationFactory): any[] {
    return [
        {provide: ValidationFactoryService, useFactory: getValidationFactory, deps: [VALIDATION_FACTORY]},
        {provide: VALIDATION_FACTORY, useFactory: validationFactory || _getValidationFactory}
    ];
}


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LayoutDrawerModule
    ],
    exports: [ConfigurableFormComponent],
    declarations: [ConfigurableFormComponent],
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
