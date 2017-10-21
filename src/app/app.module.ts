import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ConfigurableFormComponentModule } from '../lib/configuratble-form/configurable-form.module';

import { AppComponent } from './app.component';
import { simpleFormReducer } from './redux-integration/simpleForm.reducer';
import { ExampleSimpleFormComponent } from './layout-example/layout-example';
import { AppRoutingModule } from './app-routing.module';
import { MatButtonModule } from '@angular/material';
import { ReduxFormComponent } from './redux-integration/redux.component';

@NgModule({
    declarations: [
        AppComponent,
        ExampleSimpleFormComponent,
        ReduxFormComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        AppRoutingModule,
        MatButtonModule,
        ConfigurableFormComponentModule.provideForm(),
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
