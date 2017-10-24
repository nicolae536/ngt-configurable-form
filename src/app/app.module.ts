import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { MatButtonModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ConfigurableFormComponentModule } from '../lib/configuratble-form/configurable-form.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ExampleSimpleFormComponent } from './layout-example/layout-example';
import { ProvidingDataExampleComponent } from './providing-data-example/providing-data-example';
import { ReduxFormComponent } from './redux-integration/redux.component';
import { simpleFormReducer } from './redux-integration/simpleForm.reducer';
import { CustomValidationFactory } from './validators-example/custom-validation-factory';
import { ValidatorsExampleComponent } from './validators-example/validators-example.component';
import { ConfigurationChangeComponent } from './configuration-change/configuration-change';

export function createValidationFactory() {
    return new CustomValidationFactory();
}

@NgModule({
    declarations: [
        AppComponent,
        ExampleSimpleFormComponent,
        ReduxFormComponent,
        ProvidingDataExampleComponent,
        ValidatorsExampleComponent,
        ConfigurationChangeComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        AppRoutingModule,
        MatButtonModule,
        MatToolbarModule,
        ConfigurableFormComponentModule.forRoot(createValidationFactory),
        StoreModule.forRoot({
            simpleFormReducer: simpleFormReducer
        }),
        StoreDevtoolsModule.instrument()
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
