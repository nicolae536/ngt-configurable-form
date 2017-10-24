import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { ValidatorsExampleComponent } from '../validators-example/validators-example.component';

@Component({
    moduleId: module.id,
    selector: 'configuration-change',
    templateUrl: 'configuration-change.html'
})
export class ConfigurationChangeComponent extends ValidatorsExampleComponent {
    constructor(http: Http) {
        super(http);
    }
    setupConfig() {
        this.config = this.http.get(
            '/assets/layout-examples/configuration-change.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json())
            .do(() => this.isRendered = true);
    }
}