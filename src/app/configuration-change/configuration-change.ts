import { Component } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/first';
import { ValidatorsExampleComponent } from '../validators-example/validators-example.component';

@Component({
    moduleId: module.id,
    selector: 'ngt-configuration-change',
    templateUrl: 'configuration-change.html'
})
export class ConfigurationChangeComponent extends ValidatorsExampleComponent {
    constructor(http: Http) {
        super(http);
    }

    setupConfig() {
        // '/assets/layout-examples/ngt-configuration-change.json'
        this.http.get(
            '/assets/new-layout.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json())
            .do(() => this.isRendered = true)
            .subscribe(v => {
                this.config = v;
            });
    }
}
