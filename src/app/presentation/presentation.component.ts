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

    constructor(private _cd: ChangeDetectorRef,
                private _elementRef: ElementRef) {
    }

    ngAfterViewInit() {
        this._cd.detach();
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
                    // not working right now
                ]
            });
        };
        this.scriptTag.src = 'assets/lib_reveal/reveal.js';
        document.body.classList.remove('no-reveal');
        this._elementRef.nativeElement.appendChild(this.scriptTag);
    }

    ngOnDestroy(): void {
        document.body.classList.add('no-reveal');
        this._elementRef.nativeElement.removeChild(this.scriptTag);
    }
}
