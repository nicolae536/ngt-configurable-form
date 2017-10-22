import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ExampleSimpleFormComponent } from './layout-example/layout-example';
import { ReduxFormComponent } from './redux-integration/redux.component';
import { ProvidingDataComponent } from './providing-data/providing-data';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: 'layout-example',
                component: ExampleSimpleFormComponent
            },
            {
                path: 'providing-data',
                component: ProvidingDataComponent
            },
            {
                path: 'redux-example',
                component: ReduxFormComponent
            }
        ])
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
