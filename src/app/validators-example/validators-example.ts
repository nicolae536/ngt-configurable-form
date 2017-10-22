import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ProvidingDataExampleComponent } from '../providing-data-example/providing-data-example';

@Component({
    moduleId: module.id,
    selector: 'ngt-example-simple-form',
    templateUrl: './validators-example.html',
    encapsulation: ViewEncapsulation.None
})
export class ValidatorsExampleComponent extends ProvidingDataExampleComponent {
    constructor(http: Http) {
        super(http);
    }

    setupConfig() {
        this.config = this.http.get(
            '/assets/layout-examples/registration-validators.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json());
    }
}
