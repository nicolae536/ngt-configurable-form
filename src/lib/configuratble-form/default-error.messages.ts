interface ErrorMessages {
    required?: string;
    email?: string;
    integer?: string;
    number?: string;
    maxDecimalLength?: string;
    password?: string;
    date?: string;
    minDate?: string;
    maxDate?: string;
    minValue?: string;
    maxValue?: string;
    maxTime?: string;
    minTime?: string;
}

export const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
    required: 'Required',
    email: 'Invalid email',
    integer: 'Invalid integer',
    number: 'Invalid number',
    maxDecimalLength: 'Max decimal count exceeded',
    password: 'Invalid password',
    date: 'Invalid date',
    minDate: 'Min date exceeded',
    maxDate: 'Max date exceeded',
    minValue: 'Min value exceeded',
    maxValue: 'Max value exceeded',
    maxTime: 'Min time exceeded',
    minTime: 'Max time exceeded'
};
const errorKeys = {};
for (const key in DEFAULT_ERROR_MESSAGES) {
    errorKeys[key] = key;
}

export const DEFAULT_ERROR_KEYS: ErrorMessages = errorKeys;
