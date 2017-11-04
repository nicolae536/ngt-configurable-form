import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutDrawerModule } from '../layout-drawer/layout-drawer.module';
import '../models/rx-extensions';
import { ConfigurableFormComponent } from './configurable-form.component';
import { getRootProviders, IRootProviders } from './configurable-form.providers';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LayoutDrawerModule
    ],
    exports: [ConfigurableFormComponent],
    declarations: [ConfigurableFormComponent],
    providers: []
})
export class ConfigurableFormComponentModule {
    static forRoot(params: IRootProviders): ModuleWithProviders {
        return {
            ngModule: ConfigurableFormComponentModule,
            providers: getRootProviders(params)
        };
    }
}
