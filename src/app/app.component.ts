import { Component, ViewEncapsulation, HostListener } from '@angular/core';
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
    hideToolbar: boolean = true;

    @HostListener('mousemove', ['$event'])
    handleMouseMove(event: MouseEvent) {
        this.hideToolbar = event && event.y > 64;
    }
}
