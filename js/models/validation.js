export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

export function requireText(value, label, { min = 1, max = 100 } = {}) {
    if (typeof value !== "string") {
        throw new ValidationError(`${label} must be text.`);
    }

    const text = value.trim();

    if (text.length < min) {
        throw new ValidationError(min === 1 ? `${label} is required.` : `${label} must have at least ${min} characters.`);
    }

    if (text.length > max) {
        throw new ValidationError(`${label} can have at most ${max} characters.`);
    }

    return text;
}

export function optionalText(value, label, max = 300) {
    if (value === undefined || value === null) {
        return "";
    }

    return requireText(value, label, { min: 0, max });
}

export function requireOneOf(value, allowed, label) {
    if (!allowed.includes(value)) {
        throw new ValidationError(`${label} must be one of: ${allowed.join(", ")}.`);
    }

    return value;
}

export function requireNumber(value, label, { min = 0, max = 1000, integer = false } = {}) {
    const number = Number(value);

    if (value === "" || value === null || value === undefined || !Number.isFinite(number)) {
        throw new ValidationError(`${label} must be a number.`);
    }

    if (integer && !Number.isInteger(number)) {
        throw new ValidationError(`${label} must be a whole number.`);
    }

    if (number < min || number > max) {
        throw new ValidationError(`${label} must be between ${min} and ${max}.`);
    }

    return number;
}

export function requireDate(value, label) {
    if (typeof value !== "string" || value.length !== 10 || Number.isNaN(new Date(value).getTime())) {
        throw new ValidationError(`${label} must be a valid date.`);
    }

    return value;
}

export function requireDateTime(value, label) {
    if (typeof value !== "string" || Number.isNaN(new Date(value).getTime())) {
        throw new ValidationError(`${label} must be a valid date and time.`);
    }

    return value;
}

export function requireInstance(value, expectedClass, label) {
    if (!(value instanceof expectedClass)) {
        throw new ValidationError(`${label} is not valid.`);
    }

    return value;
}