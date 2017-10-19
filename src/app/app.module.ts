import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ConfigurableFormComponentModule } from '../lib/configuratble-form/configurable-form.module';

import { AppComponent } from './app.component';
import { simpleFormReducer } from './simpleForm.reducer';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        ConfigurableFormComponentModule.provideForm(),
        StoreModule.forRoot({
            simpleFormReducer: simpleFormReducer
        }),
        StoreDevtoolsModule.instrument({
            maxAge: 25 //  Retains last 25 states
        })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
