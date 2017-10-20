import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ExampleSimpleFormComponent } from './example-simple-form/example-simple-form.component';

@NgModule({
    imports: [
        RouterModule.forRoot([{
            path: "simple-example",
            component: ExampleSimpleFormComponent
        }])
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
