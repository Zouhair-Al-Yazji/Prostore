import { z } from 'zod';
import { formatNumberWithDecimals } from './utils';
import { PAYMENT_METHODS } from './constants';

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
	stock: z.number().min(0, 'Stock must be a positive number'),
	images: z.array(z.string()).min(1, 'Product must have at least one image'),
	isFeatured: z.boolean(),
	banner: z.string().nullable(),
	price: currency,
});

// Schema for updating product
export const updateProductSchema = insertProductSchema.extend({
	id: z.string().min(1, 'Id is required'),
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

// Cart Schemas
export const cartItemSchema = z.object({
	productId: z.string().min(1, 'Product is required'),
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required'),
	qty: z.number().int().nonnegative('Quantity must be a positive number'),
	image: z.string().min(1, 'Image is required'),
	price: currency,
});

export const insertCartSchema = z.object({
	items: z.array(cartItemSchema),
	itemsPrice: currency,
	shippingPrice: currency,
	taxPrice: currency,
	totalPrice: currency,
	sessionCartId: z.string().min(1, 'Session cart id is required'),
	userId: z.string().optional().nullable(),
});

// Schema for shipping address
export const shippingAddressSchema = z.object({
	fullName: z.string().min(3, 'Name must be at least 3 characters'),
	streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
	city: z.string().min(3, 'City must be at least 3 characters'),
	postalCode: z.string().min(3, 'Postal Code must be at least 3 characters'),
	country: z.string().min(3, 'Country must be at least 3 characters'),
	lat: z.number().optional(),
	lng: z.number().optional(),
});

// Schema for payment method
export const paymentMethodSchema = z
	.object({
		type: z.string().min(1, 'Payment method is required'),
	})
	.refine(data => PAYMENT_METHODS.includes(data.type), {
		path: ['type'],
		error: 'Invalid payment method',
	});

// Schema for inserting order
export const insertOrderSchema = z.object({
	userId: z.string().min(1, 'User is required'),
	itemsPrice: currency,
	shippingPrice: currency,
	taxPrice: currency,
	totalPrice: currency,
	paymentMethod: z.string().refine(data => PAYMENT_METHODS.includes(data), {
		error: 'Invalid payment method',
	}),
	shippingAddress: shippingAddressSchema,
});

// Schema for inserting an order item
export const insertOrderItemSchema = z.object({
	productId: z.string(),
	slug: z.string(),
	image: z.string(),
	name: z.string(),
	price: currency,
	qty: z.number(),
});

// Schema for the PayPal paymentResult
export const paymentResultSchema = z.object({
	id: z.string(),
	status: z.string(),
	email_address: z.string(),
	pricePaid: z.string(),
});

// Schema for the updating user profile
export const updateProfileSchema = z.object({
	email: z.email(),
	name: z.string().min(3, 'Name must be at least 3 characters'),
});

// Schema to update user
export const updateUserSchema = updateProfileSchema.extend({
	id: z.string().min(1, 'ID is required'),
	role: z.string().min(1, 'Role is required'),
});

// Schema to insert review
export const insertReviewSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 chars'),
	description: z.string().min(3, 'Description must be at least 3 chars'),
	productId: z.string().min(1, 'Product is required'),
	userId: z.string().min(1, 'User is required'),
	rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
});
