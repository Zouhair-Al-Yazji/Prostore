import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Convert Prisma object into JS object
export function convertToPlainObject<T>(value: T): T {
	return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimals(num: number): string {
	const [int, decimal] = num.toString().split('.');
	return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

// Format errors
// eslint-disabled-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
	if (error.name === 'ZodError') {
		// Handle Zod error
		const fieldErrors = Object.keys(error.issues).map(field => error.issues[field].message);

		return fieldErrors.join('. ');
	} else if (error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002') {
		const field = error.meta?.target?.[0]; // Optional chaining for safety

		// Check if field exists before manipulating it
		if (field) {
			return field.charAt(0).toUpperCase() + field.slice(1) + ' already exists';
		} else {
			return 'This record already exists';
		}
	} else {
		// Handle other error
		return typeof error.message === 'string' ? error.message : JSON.stringify(error.message);
	}
}
