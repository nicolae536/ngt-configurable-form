import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ExampleSimpleFormComponent } from './layout-example/layout-example';
import { ReduxFormComponent } from './redux-integration/redux.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: 'layout-example',
                component: ExampleSimpleFormComponent
            },
            {
                path: 'redux-example',
                component: ReduxFormComponent
            },
            {
                path: 'redu1x-example',
                component: ExampleSimpleFormComponent
            }
        ])
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
