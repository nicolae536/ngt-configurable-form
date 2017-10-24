import { Component, ChangeDetectorRef, ViewEncapsulation, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'ngt-presentation-component',
    templateUrl: 'presentation.html',
    encapsulation: ViewEncapsulation.None
})
export class PresentationComponent implements AfterViewInit, OnDestroy {
    private scriptTag: any;

    constructor(private _cd: ChangeDetectorRef,
                private _elementRef: ElementRef) {
        this._cd.detach();
    }

    ngAfterViewInit() {
        this.scriptTag = document.createElement('script');
        this.scriptTag.type = 'text/javascript';
        this.scriptTag.onload = () => {
            window['Reveal']['initialize']({
                controls: true,
                progress: true,
                history: true,
                center: true,
                transition: 'slide', // none/fade/slide/convex/concave/zoom
                // More info https://github.com/hakimel/reveal.js#dependencies
                dependencies: [
                    { src: 'lib/js/classList.js', condition: function() { return !document.body.classList; } },
                    { src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
                    { src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
                    { src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
                    { src: 'plugin/zoom-js/zoom.js', async: true },
                    { src: 'plugin/notes/notes.js', async: true }
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
