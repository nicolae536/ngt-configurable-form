import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'app';
    hideToolbar: boolean = false;
    isPresentationView: boolean = false;

    constructor(private _router: Router) {
        this._router.events.subscribe(valu => {
            this.isPresentationView = valu.toString().indexOf('presentation') !== -1;
        });
    }

    navigateBack() {
        window.history.back();
    }

    @HostListener('mousemove', ['$event'])
    handleMouseMove(event: MouseEvent) {
        if (!this.isPresentationView) {
            return;
        }

        const newValue = event && event.y > 64;
        if (newValue === this.hideToolbar) {
            return;
        }
        this.hideToolbar = newValue;
    }
}
