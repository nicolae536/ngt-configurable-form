import { Component, ViewEncapsulation } from '@angular/core';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/do';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';
}
