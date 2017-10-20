import { Directive, Optional, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';

@Directive({selector: '[ngtExpansionPanelToggle]'})
export class ExpansionPanelToggleDirective {
    @Input()
    set isExpanded(state: boolean) {
        this.setIsExpanded(state);
    };

    @Output() onToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(@Optional() private _matExpansionPanel: MatExpansionPanel) {
    }

    @HostListener('click', ['$event'])
    togglePanel(event) {
        this.onToggle.emit(this.getExpandedState());
    }

    private setIsExpanded(state: boolean) {
        if (!this._matExpansionPanel) {
            return;
        }

        let panelState = this._matExpansionPanel._getExpandedState();
        let newState = this.toPanelState(state);

        if (newState === panelState) {
            return;
        }

        this._matExpansionPanel.toggle();
    }

    private toPanelState(state: boolean) {
        return state
            ? 'expanded'
            : 'collapsed';
    }

    private getExpandedState(): boolean {
        let panelState = this._matExpansionPanel._getExpandedState()

        if (panelState === 'expanded') {
            return true;
        }

        return false;
    }
}