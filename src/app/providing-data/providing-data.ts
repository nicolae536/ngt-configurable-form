import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { STATES } from '../mock-data.providers';

@Component({
    moduleId: module.id,
    selector: 'ngt-example-simple-form',
    templateUrl: './providing-data.html',
    encapsulation: ViewEncapsulation.None
})
export class ProvidingDataComponent {
    isValid: boolean;
    config: Observable<any | Promise<any>>;
    dataProviders: any = {
        tShirtSize: Observable.of(STATES)
    };

    constructor(private _http: Http) {
        this.config = this._http.get(
            '/assets/layout-examples/registration-1.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json());
    }
}
