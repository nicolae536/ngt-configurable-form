import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IFormConfig } from '../shared/configuratble-form/configurable-form.interfaces';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';
    config: Observable<IFormConfig>;

    constructor(private _http: Http) {
        this.config = this._http.get('/assets/first-form.config.json', {headers: new Headers({'Content-Type': 'application/json'})}).map(r => r.json());
    }
}
