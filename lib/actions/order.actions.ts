'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObject, formatError } from '../utils';
import { insertOrderSchema } from '../validators';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { paypal } from '../paypal';
import { PaymentResult } from '@/types';
import { revalidatePath } from 'next/cache';

// Create order and create the order items
export async function createOrder() {
	try {
		const session = await auth();
		if (!session) throw new Error('User is not authenticated');

		const cart = await getMyCart();
		const userId = session?.user?.id;
		if (!userId) throw new Error('User not found');

		const user = await getUserById(userId);

		if (!cart || cart.items.length === 0) {
			return {
				success: false,
				message: 'Your cart is empty',
				redirectTo: '/cart',
			};
		}

		if (!user.address) {
			return {
				success: false,
				message: 'No shipping address',
				redirectTo: '/shipping-address',
			};
		}

		if (!user.paymentMethod) {
			return {
				success: false,
				message: 'No payment method',
				redirectTo: '/payment-method',
			};
		}

		// Create order object
		const order = insertOrderSchema.parse({
			userId: user.id,
			shippingAddress: user.address,
			paymentMethod: user.paymentMethod,
			itemsPrice: cart.itemsPrice,
			shippingPrice: cart.shippingPrice,
			taxPrice: cart.taxPrice,
			totalPrice: cart.totalPrice,
		});

		// Create a transaction to create order and order items in database
		const insertedOrderId = await prisma.$transaction(async tx => {
			// Create order
			const insertedOrder = await tx.order.create({ data: order });

			// Create order items from the cart items
			const orderItemsData = cart.items.map(item => ({
				...item,
				price: item.price,
				orderId: insertedOrder.id,
			}));

			await tx.orderItem.createMany({ data: orderItemsData });

			// Clear cart
			await tx.cart.update({
				where: { id: cart.id },
				data: {
					items: [],
					totalPrice: 0,
					taxPrice: 0,
					shippingPrice: 0,
					itemsPrice: 0,
				},
			});

			return insertedOrder.id;
		});

		if (!insertedOrderId) throw new Error('Order not created');

		return {
			success: true,
			message: 'Order created',
			redirectTo: `/order/${insertedOrderId}`,
		};
	} catch (error) {
		if (isRedirectError(error)) throw error;
		return { success: false, message: formatError(error) };
	}
}

export async function getOrderById(orderId: string) {
	const data = await prisma.order.findFirst({
		where: { id: orderId },
		include: {
			orderitems: true,
			user: { select: { email: true, name: true } },
		},
	});

	return convertToPlainObject(data);
}

// Create new paypal order
export async function createPaypalOrder(orderId: string) {
	try {
		// Get order from database
		const order = await prisma.order.findFirst({
			where: { id: orderId },
		});

		if (order) {
			// Create paypal order
			const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

			// Update order with paypal order id
			await prisma.order.update({
				where: { id: orderId },
				data: {
					paymentResult: {
						id: paypalOrder.id,
						email_address: '',
						status: '',
						paidPrice: '',
					},
				},
			});

			return { success: true, message: 'Item order created successfully', data: paypalOrder.id };
		} else {
			throw new Error('Order not found');
		}
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

// Approve paypal order and update order to paid
export async function approvePaypalOrder(orderId: string, data: { orderID: string }) {
	try {
		// Get order from database
		const order = await prisma.order.findFirst({
			where: { id: orderId },
		});

		if (!order) throw new Error('Order not found');

		const captureData = await paypal.capturePayment(data.orderID);

		if (
			!captureData ||
			captureData.id !== (order.paymentResult as PaymentResult)?.id ||
			captureData.status !== 'COMPLETED'
		) {
			throw new Error('Error in paypal payment');
		}

		// Update order to paid
		await UpdateOrderToPaid({
			orderId,
			paymentResult: {
				id: captureData.id,
				email_address: captureData.payer.email_address,
				status: captureData.status,
				pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
			},
		});

		revalidatePath(`/order/${orderId}`);

		return { success: true, message: 'Your order has been paid' };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

async function UpdateOrderToPaid({
	orderId,
	paymentResult,
}: {
	orderId: string;
	paymentResult?: PaymentResult;
}) {
	// Get order from database
	const order = await prisma.order.findFirst({
		where: { id: orderId },
		include: { orderitems: true },
	});

	if (!order) throw new Error('Order not found');
	if (order.isPaid) throw new Error('Order is already paid');

	// Transaction to update order and account for product stock
	await prisma.$transaction(async tx => {
		// Iterate over products and update stock
		for (const item of order.orderitems) {
			await tx.product.update({
				where: { id: item.productId },
				data: { stock: { decrement: item.qty } },
			});
		}

		// Set the order to paid
		await tx.order.update({
			where: { id: orderId },
			data: {
				isPaid: true,
				paidAt: new Date(),
				paymentResult,
			},
		});
	});

	// Get updated order after transaction
	const updatedOrder = await prisma.order.findFirst({
		where: { id: orderId },
		include: {
			orderitems: true,
			user: { select: { name: true, email: true } },
		},
	});

	if (!updatedOrder) throw new Error('Order not found');
}
