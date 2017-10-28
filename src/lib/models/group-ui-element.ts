import { FormGroup } from '@angular/forms';
import { elementErrorMessages } from '../element-wrapper/element-wrapper.consts';
import { BaseModel } from './base-model';
import { Dictionary, FormGroupValidatorMetadata } from './shared.interfaces';

export const GROUP_TYPES = {
    ngtCard: 'ngt-card',
    matCard: 'mat-card',
    matExpansionPane: 'mat-expansion-pane',
    simpleElement: 'simple-element'
};

export class GroupUiElement extends BaseModel<FormGroup> {
    name: string;
    type: string; // 'ngt-card' | 'mat-card' | 'mat-expansion-pane' | 'simple-element';
    required: boolean;
    disabled: boolean;
    title?: string;
    description?: string;
    // lines: string[][];
    classMap?: Dictionary<any>;

    constructor(groupElement: Dictionary<any>) {
        super(groupElement);
        this.validateGroup();
    }

    private validateGroup() {
        if (!this.name) {
            this.throwError(elementErrorMessages.noName);
        }

        if (!this.type) {
            this.type = GROUP_TYPES.simpleElement;
        }

        // if (!this.isArray(this.lines)) {
        //     this.throwError(elementErrorMessages.invalidLines);
        // }
    }
}
