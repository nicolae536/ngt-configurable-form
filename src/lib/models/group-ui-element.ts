import { FormGroup } from '@angular/forms';
import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { BaseElement } from './base-element';
import { Dictionary, FormGroupValidatorMetadata } from './shared.interfaces';

export interface GroupExpandChangeEvent {
    name: string;
    isExpanded: boolean;
}

export const GROUP_TYPES = {
    ngtCard: 'ngt-card',
    matCard: 'mat-card',
    matExpansionPane: 'mat-expansion-pane'
};

export class GroupUiElement extends BaseElement<FormGroup> {
    name: string;
    type: string; // 'ngt-card' | 'mat-card' | 'mat-expansion-pane' | 'simple-element';
    required: boolean;
    disabled: boolean;
    title?: string;
    description?: string;
    // lines: string[][];
    isExpanded?: boolean;
    classMap?: Dictionary<any>;

    constructor(groupElement: Dictionary<any>) {
        super(groupElement, true);
        this.validateGroup();
    }

    private validateGroup() {
        if (!this.name) {
            this.throwError(elementErrorMessages.noName);
        }

        if (!this.type) {
            this.type = GROUP_TYPES.ngtCard;
        }

        // if (!this.isArray(this.lines)) {
        //     this.throwError(elementErrorMessages.invalidLines);
        // }
    }
}
