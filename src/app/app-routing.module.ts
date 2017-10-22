import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ExampleSimpleFormComponent } from './layout-example/layout-example';
import { ReduxFormComponent } from './redux-integration/redux.component';
import { ProvidingDataExampleComponent } from './providing-data-example/providing-data-example';
import { ValidatorsExampleComponent } from './validators-example/validators-example';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: 'layout-example',
                component: ExampleSimpleFormComponent
            },
            {
                path: 'providing-data-example',
                component: ProvidingDataExampleComponent
            },
            {
                path: 'validators-example',
                component: ValidatorsExampleComponent
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
