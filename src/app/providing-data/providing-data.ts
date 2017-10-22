import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { CITYES } from '../mock-data.providers';

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
        city: new BehaviorSubject(CITYES)
    };
    listenersMap: any = {
        city: new Subject<string>()
    };

    constructor(private _http: Http) {
        this.config = this._http.get(
            '/assets/layout-examples/registration-providing-data.json',
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json());

        this.listenersMap.city.subscribe(value => {
            if (!value) {
                this.dataProviders.city.next(CITYES);
            }

            this.dataProviders.city.next(
                CITYES.filter(city => {
                    return city.city.toLowerCase().indexOf(value.toLowerCase()) !== -1
                })
            );
        });
    }
}
