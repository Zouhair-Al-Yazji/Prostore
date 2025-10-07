'use server';

import prisma from '@/db/prisma';
import { LATEST_PRODUCTS_LIMIT } from '../constants';
import { convertToPlainObject } from '../utils';
import type { Product } from '@/types';

export async function getLatestProducts(): Promise<Product[]> {
	const data = await prisma.product.findMany({
		take: LATEST_PRODUCTS_LIMIT,
		orderBy: {
			createdAt: 'desc',
		},
	});

	return convertToPlainObject(data);
}

export async function getProductBySlug(slug: string) {
	return await prisma.product.findFirst({
		where: {
			slug: slug,
		},
	});
}
