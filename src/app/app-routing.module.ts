import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { ConfigurationChangeComponent } from './configuration-change/configuration-change';
import { ExampleSimpleFormComponent } from './layout-example/layout-example';
import { PresentationComponent } from './presentation/presentation.component';
import { ProvidingDataExampleComponent } from './providing-data-example/providing-data-example';
import { ReduxFormComponent } from './redux-integration/redux.component';
import { ValidatorsExampleComponent } from './validators-example/validators-example.component';

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
                path: 'configuration-change',
                component: ConfigurationChangeComponent
            },
            {
                path: 'redux-example',
                component: ReduxFormComponent
            },
            {
                path: 'presentation',
                component: PresentationComponent
            },
            {
                path: '**',
                redirectTo: 'presentation'
            }
        ])
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {
}
