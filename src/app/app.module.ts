import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ConfigurableFormComponentModule } from '../lib/configuratble-form/configurable-form.module';

import { AppComponent } from './app.component';
import { simpleFormReducer } from './simpleForm.reducer';
import { ExampleSimpleFormComponent } from './example-simple-form/example-simple-form.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
    declarations: [
        AppComponent,
        ExampleSimpleFormComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        AppRoutingModule,
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
