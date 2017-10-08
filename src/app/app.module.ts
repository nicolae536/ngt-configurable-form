import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigurableFormComponentModule } from '../shared/configuratble-form/configurable-form.module';

import { AppComponent } from './app.component';
import { MAT_PLACEHOLDER_GLOBAL_OPTIONS } from '@angular/material';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        ConfigurableFormComponentModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
