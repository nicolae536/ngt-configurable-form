import { FormGroup } from '@angular/forms';
import { IValidationResult } from '../../lib/configuratble-form/base-validators';
import { FormGroupValidatorMetadata, IElementConfig } from '../../lib/configuratble-form/configurable-form.interfaces';
import { IValidationFactory, IValidatorFunction } from '../../lib/configuratble-form/validation-factory.interface';

export class CustomValidationFactory implements IValidationFactory {
    phoneRegex = /^(?=0[723][2-8]\d{7})(?!.*(.)\1{2,}).{10}$/;

    hasValidator(validator: FormGroupValidatorMetadata): boolean {
        if (validator.type === "phone") {
            return true;
        }

        return false;
    }

    getValidator(validator: FormGroupValidatorMetadata): IValidatorFunction {
        switch (validator.type) {
            case "phone":
                return this.phoneValidator.bind(this);
        }
    }

    private phoneValidator(ngFormControl: FormGroup,
                           elementConfig: IElementConfig,
                           value: any,
                           staticMetadata: any): IValidationResult {
        if (!value || !value.match(this.phoneRegex)) {
            return {"invalidPhoneNumber": true};
        }

        return null;
    }
}