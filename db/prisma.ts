import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = global as unknown as {
	prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
};

// Function to create the extended client
function createExtendedPrismaClient() {
	const basePrisma = new PrismaClient().$extends({
		result: {
			product: {
				price: {
					compute(product) {
						return product.price.toString();
					},
				},
				rating: {
					compute(product) {
						return product.rating.toString();
					},
				},
			},
			cart: {
				itemsPrice: {
					needs: { itemsPrice: true },
					compute(cart) {
						return cart.itemsPrice.toString();
					},
				},
				shippingPrice: {
					needs: { shippingPrice: true },
					compute(cart) {
						return cart.shippingPrice.toString();
					},
				},
				taxPrice: {
					needs: { taxPrice: true },
					compute(cart) {
						return cart.taxPrice.toString();
					},
				},
				totalPrice: {
					needs: { totalPrice: true },
					compute(cart) {
						return cart.totalPrice.toString();
					},
				},
			},
			order: {
				itemsPrice: {
					needs: { itemsPrice: true },
					compute(order) {
						return order.itemsPrice.toString();
					},
				},
				shippingPrice: {
					needs: { shippingPrice: true },
					compute(order) {
						return order.shippingPrice.toString();
					},
				},
				taxPrice: {
					needs: { taxPrice: true },
					compute(order) {
						return order.taxPrice.toString();
					},
				},
				totalPrice: {
					needs: { totalPrice: true },
					compute(order) {
						return order.totalPrice.toString();
					},
				},
			},
			orderItem: {
				price: {
					compute(orderItem) {
						return orderItem.price.toString();
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
