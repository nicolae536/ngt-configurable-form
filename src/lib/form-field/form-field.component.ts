import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, Input, ViewEncapsulation, ContentChildren, QueryList, AfterViewInit } from '@angular/core';
import { MatPrefix, MatSuffix } from '@angular/material';

@Component({
    selector: 'ngt-form-field',
    templateUrl: './form-field.html',
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('transitionMessages', [
            state('enter', style({opacity: 1, transform: 'translateY(0%)'})),
            transition('void => enter', [
                style({opacity: 0, transform: 'translateY(-100%)'}),
                animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
            ]),
        ])
    ]
})
export class FormFieldComponent implements AfterViewInit {
    @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

    @Input()
    set hasErrors(errors: boolean) {
        this.setMessageDisplay(errors);
    }

    @ContentChildren(MatPrefix) prefixChildren: QueryList<MatPrefix>;
    @ContentChildren(MatSuffix) suffixChildren: QueryList<MatSuffix>;

    messageDisplay: string = '';
    lastErrors: boolean;
    subscriptAnimationState: string = '';

    private _isViewInitialized: boolean = false;

    ngAfterViewInit(): void {
        this.subscriptAnimationState = 'enter';
        this._isViewInitialized = true;
        this.recheckMessageDisplay();
    }

    private setMessageDisplay(errors: boolean) {
        this.lastErrors = errors;
    }

    private recheckMessageDisplay() {
        if (this._isViewInitialized) {
            this.messageDisplay = this.lastErrors ? 'errors' : 'hint';
        }
    }
}
