
export function isNotEmptyString(value: string) {
	return isValidString(value) && value !== '';
}

export function isValidString(value: any) {
	return !isNullOrUndefined(value) && typeof value === 'string';
}

export function isNullOrUndefined(value: any) {
	return isUndefined(value) || isNull(value);
}

export function isUndefined(value: undefined) {
	return value === undefined;
}

export function isNull(value: null) {
	return value === null;
}

export function isNoEmptyArray(value: any[]) {
	return isArray(value) && value.length > 0;
}

export function isArray(value: any[]) {
	return !isNullOrUndefined(value) && Array.isArray(value);
}
