import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { CITYES } from '../mock-data.providers';

@Component({
    moduleId: module.id,
    selector: 'ngt-example-simple-form',
    templateUrl: './providing-data-example.html',
    encapsulation: ViewEncapsulation.None
})
export class ProvidingDataExampleComponent {
    isValid: boolean;
    isRendered: boolean;
    formUrl: string = '/assets/layout-examples/registration-providing-data.json';
    config: Observable<any | Promise<any>>;
    firstFifty = CITYES.slice(0, 50);
    dataProviders: any = {
        city: new BehaviorSubject(this.firstFifty)
    };
    listenersMap: any = {
        city: new Subject<string>()
    };

    constructor(public http: Http) {
        this.setupConfig();
        this.listenersMap.city
            .debounceTime(200)
            .subscribe(value => this.sendDataToAutocomplete(value));
    }

    setupConfig() {
        this.config = this.http.get(
            this.formUrl,
            {headers: new Headers({'Content-Type': 'application/json'})}
        ).map(r => r.json())
            .do(() => this.isRendered = true);
    }

    private sendDataToAutocomplete(value) {
        if (!value) {
            if (this.dataProviders.city.value !== this.firstFifty) {
                this.dataProviders.city.next(this.firstFifty);
            }
            return;
        }

        this.dataProviders.city.next(
            CITYES.filter(city => {
                return city.city.toLowerCase().indexOf(value.toLowerCase()) !== -1
            })
        );
    }
}
