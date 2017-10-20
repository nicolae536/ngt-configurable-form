import { Component, ViewEncapsulation } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { IFormConfig } from '../lib/configuratble-form/configurable-form.interfaces';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';

}
