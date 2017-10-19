import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfigurableFormComponentModule } from '../lib/configuratble-form/configurable-form.module';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        ConfigurableFormComponentModule.provideForm()
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
