import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = global as unknown as {
	prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
};

function createExtendedPrismaClient() {
	const basePrisma = new PrismaClient().$extends({
		result: {
			product: {
				price: {
					compute(product) {
						// Add null/undefined check
						return product?.price?.toString() ?? '0';
					},
				},
				rating: {
					compute(product) {
						// Add null/undefined check
						return product?.rating?.toString() ?? '0';
					},
				},
			},
			cart: {
				itemsPrice: {
					needs: { itemsPrice: true },
					compute(cart) {
						return cart?.itemsPrice?.toString() ?? '0';
					},
				},
				shippingPrice: {
					needs: { shippingPrice: true },
					compute(cart) {
						return cart?.shippingPrice?.toString() ?? '0';
					},
				},
				taxPrice: {
					needs: { taxPrice: true },
					compute(cart) {
						return cart?.taxPrice?.toString() ?? '0';
					},
				},
				totalPrice: {
					needs: { totalPrice: true },
					compute(cart) {
						return cart?.totalPrice?.toString() ?? '0';
					},
				},
			},
			order: {
				itemsPrice: {
					needs: { itemsPrice: true },
					compute(order) {
						return order?.itemsPrice?.toString() ?? '0';
					},
				},
				shippingPrice: {
					needs: { shippingPrice: true },
					compute(order) {
						return order?.shippingPrice?.toString() ?? '0';
					},
				},
				taxPrice: {
					needs: { taxPrice: true },
					compute(order) {
						return order?.taxPrice?.toString() ?? '0';
					},
				},
				totalPrice: {
					needs: { totalPrice: true },
					compute(order) {
						return order?.totalPrice?.toString() ?? '0';
					},
				},
			},
			orderItem: {
				price: {
					compute(orderItem) {
						return orderItem?.price?.toString() ?? '0';
					},
				},
			},
		},
	});

	return basePrisma.$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? createExtendedPrismaClient();

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export default prisma;
