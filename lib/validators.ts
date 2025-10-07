import { z } from 'zod';
import { formatNumberWithDecimals } from './utils';

const currency = z
	.string()
	.refine(
		value => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimals(Number(value))),
		'Price must have two decimal places'
	);

// Schema for inserting product
export const insertProductSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 chars'),
	slug: z.string().min(3, 'Slug must be at least 3 chars'),
	category: z.string().min(3, 'Category must be at least 3 chars'),
	brand: z.string().min(3, 'Brand must be at least 3 chars'),
	description: z.string().min(3, 'Description must be at least 3 chars'),
	stock: z.coerce.number(),
	images: z.array(z.string()).min(1, 'Product must have at least one image'),
	isFeatured: z.boolean(),
	banner: z.string().nullable(),
	price: currency,
});

// Schema for signing users in
export const signInFormSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Schema for signing up a user
export const signUpFormSchema = z
	.object({
		name: z.string().min(3, 'name must be at least 3 characters'),
		email: z.email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
	})
	.refine(data => data.confirmPassword === data.password, {
		error: "Passwords don't match",
		path: ['confirmPassword'],
	});
