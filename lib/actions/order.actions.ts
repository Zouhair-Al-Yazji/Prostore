'use server';

import { auth } from '@/auth';
import prisma from '@/db/prisma';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObject, formatError, formatId } from '../utils';
import { insertOrderSchema } from '../validators';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { paypal } from '../paypal';
import { PaymentResult } from '@/types';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE } from '../constants';
import { Prisma } from '@prisma/client';

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
		await updateOrderToPaid({
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

export async function updateOrderToPaid({
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

// Get user's orders
export async function getMyOrders({ limit = PAGE_SIZE, page }: { limit?: number; page: number }) {
	const session = await auth();
	if (!session) throw new Error('User is not authorized');

	const data = await prisma.order.findMany({
		where: { userId: session.user?.id },
		orderBy: { createdAt: 'desc' },
		take: limit,
		skip: (page - 1) * limit,
	});

	const dataCount = await prisma.order.count({
		where: { userId: session.user?.id },
	});

	return {
		data,
		totalPages: Math.ceil(dataCount / limit),
	};
}

type SalesDataType = {
	month: string;
	totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummery() {
	// Get count for each resource
	const ordersCount = await prisma.order.count();
	const usersCount = await prisma.user.count();
	const productsCount = await prisma.product.count();

	// Calculate the total sales
	const totalSales = await prisma.order.aggregate({
		_sum: { totalPrice: true },
	});

	// Get monthly sales
	const salesDataRow = await prisma.$queryRaw<
		Array<{ month: string; totalSales: Prisma.Decimal }>
	>`SELECT to_char("createdAt", 'MM/YY') as "month",  sum("totalPrice") as "totalSales" From "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

	const salesData: SalesDataType = salesDataRow.map(entry => ({
		month: entry.month,
		totalSales: Number(entry.totalSales),
	}));

	// Get latest sales
	const latestSales = await prisma.order.findMany({
		orderBy: {
			createdAt: 'desc',
		},
		include: {
			user: { select: { name: true } },
		},
		take: 6,
	});

	return {
		ordersCount,
		usersCount,
		productsCount,
		totalSales,
		salesData,
		latestSales,
	};
}

// Get all the orders
export async function getAllOrders({
	limit = PAGE_SIZE,
	page,
	query,
}: {
	limit?: number;
	page: number;
	query: string;
}) {
	const queryFilter: Prisma.OrderWhereInput =
		query && query !== 'all'
			? {
					user: {
						name: {
							contains: query,
							mode: 'insensitive',
						} as Prisma.StringFilter,
					},
			  }
			: {};

	const data = await prisma.order.findMany({
		where: {
			...queryFilter,
		},
		orderBy: { createdAt: 'desc' },
		take: limit,
		skip: (page - 1) * limit,
		include: { user: { select: { name: true } } },
	});

	const dataCount = await prisma.order.count();

	return {
		data,
		totalPages: Math.ceil(dataCount / limit),
	};
}

// Delete an order
export async function deleteOrderById(orderId: string) {
	try {
		await prisma.order.delete({
			where: { id: orderId },
		});

		revalidatePath('/admin/orders');
		return { success: true, message: `${formatId(orderId)} order deleted successfully` };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

// Update COD order to paid
export async function updateOrderToPaidCOD(orderId: string) {
	try {
		await updateOrderToPaid({ orderId });
		revalidatePath(`/order/${orderId}`);

		return { success: true, message: 'Order marked as paid' };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

// Update COD order to delivered
export async function deliverOrder(orderId: string) {
	try {
		const order = await prisma.order.findFirst({
			where: { id: orderId },
		});

		if (!order) throw new Error('Order not found');
		if (!order.isPaid) throw new Error('Order is not paid');

		await prisma.order.update({
			where: { id: orderId },
			data: { isDelivered: true, deliveredAt: new Date() },
		});

		revalidatePath(`/order/${orderId}`);

		return { success: true, message: 'Order has been marked delivered' };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}
