import { Component, ChangeDetectorRef, ViewEncapsulation, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { EXAMPLES } from './presentation.consts';

@Component({
    moduleId: module.id,
    selector: 'ngt-presentation-component',
    templateUrl: 'presentation.html',
    encapsulation: ViewEncapsulation.None
})
export class PresentationComponent implements AfterViewInit, OnDestroy {
    codeExamples = EXAMPLES;
    private scriptTag: any;
    private scriptTag1: any;

    constructor(private _cd: ChangeDetectorRef,
                private _elementRef: ElementRef) {
    }

    ngAfterViewInit() {
        this._cd.detach();

        // head.min.js
        this.scriptTag1 = document.createElement('script');
        this.scriptTag1.type = 'text/javascript';
        this.scriptTag1.onload = () => this.loadReavealJs();
        this.scriptTag1.src = 'libs/head.min.js';
        document.body.classList.remove('no-reveal');
        this._elementRef.nativeElement.appendChild(this.scriptTag1);
    }

    ngOnDestroy(): void {
        document.body.classList.add('no-reveal');
        this._elementRef.nativeElement.removeChild(this.scriptTag);
        this._elementRef.nativeElement.removeChild(this.scriptTag1);
    }

    private loadReavealJs() {
        this.scriptTag = document.createElement('script');
        this.scriptTag.type = 'text/javascript';
        this.scriptTag.onload = () => {
            window['Reveal']['initialize']({
                controls: true,
                width: 960,
                height: 700,
                history: true,
                center: true,
                keyboard: true,
                transition: 'slide', // none/fade/slide/convex/concave/zoom
                transitionSpeed: 'slow', // default/fast/slow
                dependencies: [
                    { src: '/libs/zoom.js', async: true },
                ]
            });

            // this.l
        };
        this.scriptTag.src = 'libs/reveal.js';
        document.body.classList.remove('no-reveal');
        this._elementRef.nativeElement.appendChild(this.scriptTag);
    }
}
