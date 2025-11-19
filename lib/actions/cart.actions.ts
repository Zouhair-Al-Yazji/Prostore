'use server';

import type { CartItem } from '@/types';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

function calcPrice(items: CartItem[]) {
	const itemsPrice = round2(items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)),
		shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
		taxPrice = round2(0.15 * itemsPrice),
		totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

	return {
		itemsPrice: itemsPrice.toFixed(2),
		shippingPrice: shippingPrice.toFixed(2),
		taxPrice: taxPrice.toFixed(2),
		totalPrice: totalPrice.toFixed(2),
	};
}

export async function addItemToCart(data: CartItem) {
	try {
		// Check for cart cookie
		const sessionCartId = (await cookies()).get('sessionCartId')?.value;
		if (!sessionCartId) throw new Error('Cart session not found');

		// Get session and user id
		const session = await auth();
		const userId = session?.user?.id ? (session.user.id as string) : undefined;

		// Get cart
		const cart = await getMyCart();

		// Parse and validate item
		const item = cartItemSchema.parse(data);

		// Find product in database
		const product = await prisma.product.findFirst({
			where: { id: item.productId },
		});

		if (!product) throw new Error('Product not found');

		if (!cart) {
			// Create a new Cart object
			const newCart = insertCartSchema.parse({
				userId,
				sessionCartId,
				items: [item],
				...calcPrice([item]),
			});

			// Add to database
			await prisma.cart.create({
				data: newCart,
			});

			// Revalidate product page
			revalidatePath(`/product/${product.slug}`);
			return { success: true, message: `${product.name} added to cart` };
		} else {
			// Check if item is already in the cart
			const existItem = (cart.items as CartItem[]).find(
				cartItem => cartItem.productId === item.productId
			);

			if (existItem) {
				// Check stock
				if (product.stock < existItem.qty + 1) throw new Error('Not enough stock');

				// Update quantity
				(cart.items as CartItem[]).find(cartItem => cartItem.productId === item.productId)!.qty =
					existItem.qty + 1;
			} else {
				// if item does not exist in cart
				// Check stock
				if (product.stock < 1) throw new Error('Not enough stock');

				// Add item to the cart.items
				cart.items.push(item);
			}

			// Save to database
			await prisma.cart.update({
				where: { id: cart.id },
				data: {
					items: cart.items as Prisma.CartUpdateitemsInput[],
					...calcPrice(cart.items as CartItem[]),
				},
			});

			revalidatePath(`/product/${product.slug}`);

			return {
				success: true,
				message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`,
			};
		}
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

export async function getMyCart() {
	// Check for cart cookie
	const sessionCartId = (await cookies()).get('sessionCartId')?.value;
	if (!sessionCartId) throw new Error('Cart session not found');

	// Get session and user id
	const session = await auth();
	const userId = session?.user?.id ? (session.user.id as string) : undefined;

	// Get User cart from database
	const cart = await prisma.cart.findFirst({
		where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
	});

	if (!cart) return undefined;

	// Convert decimals and return
	return convertToPlainObject({
		...cart,
		items: cart.items as CartItem[],
		itemsPrice: cart.itemsPrice.toString(),
		shippingPrice: cart.shippingPrice.toString(),
		taxPrice: cart.taxPrice.toString(),
		totalPrice: cart.totalPrice.toString(),
	});
}

export async function removeItemFromCart(productId: string) {
	try {
		// Check for cart cookie
		const sessionCartId = (await cookies()).get('sessionCartId')?.value;
		if (!sessionCartId) throw new Error('Cart session not found');

		// Get product
		const product = await prisma.product.findFirst({
			where: { id: productId },
		});

		if (!product) throw new Error('Product not found');

		// Get user cart
		const cart = await getMyCart();
		if (!cart) throw new Error('Cart not found');

		// Check for item
		const exist = (cart.items as CartItem[]).find(item => item.productId === productId);
		if (!exist) throw new Error('Item not found');

		// Check id only 1 qty
		if (exist.qty === 1) {
			// Remove from cart
			cart.items = (cart.items as CartItem[]).filter(item => item.productId !== productId);
		} else {
			// Decrease qty
			(cart.items as CartItem[]).find(item => item.productId === productId)!.qty = exist.qty - 1;
		}

		// Update cart in database
		await prisma.cart.update({
			where: { id: cart.id },
			data: {
				items: cart.items as Prisma.CartUpdateitemsInput[],
				...calcPrice(cart.items as CartItem[]),
			},
		});

		revalidatePath(`/product/${product.slug}`);

		return { success: true, message: 'Item removed from cart' };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

export async function mergeAnonymousCartIntoUserCart(userId: string, sessionCartId: string) {
	try {
		// Find the anonymous cart and the user's cart
		const anonymousCart = await prisma.cart.findFirst({
			where: { sessionCartId },
		});

		const userCart = await prisma.cart.findFirst({
			where: { userId },
		});

		if (anonymousCart) {
			if (userCart) {
				// Merge items from anonymous cart to user's cart
				const mergedItems = [...(userCart.items as CartItem[])];

				for (const anonymousItem of anonymousCart.items as CartItem[]) {
					const existingItem = mergedItems.find(item => item.productId === anonymousItem.productId);

					if (existingItem) {
						// If item exists, update quantity
						existingItem.qty += anonymousItem.qty;
					} else {
						// If item doesn't exist, add it to the cart
						mergedItems.push(anonymousItem);
					}
				}

				// Update user's cart with merged items and recalculate price
				await prisma.cart.update({
					where: { id: userCart.id },
					data: {
						items: mergedItems as Prisma.CartUpdateitemsInput[],
						...calcPrice(mergedItems),
					},
				});

				// Delete the anonymous cart
				await prisma.cart.delete({
					where: { id: anonymousCart.id },
				});
			} else {
				// If user has no cart, assign the anonymous cart to the user
				await prisma.cart.update({
					where: { id: anonymousCart.id },
					data: { userId },
				});
			}
		}
	} catch (error) {
		console.error('Error merging carts:', error);
		throw new Error('Could not merge carts');
	}
}
