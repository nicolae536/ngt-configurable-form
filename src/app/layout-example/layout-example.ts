import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
    moduleId: module.id,
    selector: 'ngt-example-simple-form',
    templateUrl: 'layout-example.html',
    encapsulation: ViewEncapsulation.None
})
export class ExampleSimpleFormComponent {
    isValid: boolean;
    config: Observable<any | Promise<any>>;

    constructor(private _http: Http) {
        this.config = this._http.get(
            '/assets/layout-examples/registration-layout.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json());
    }
}
