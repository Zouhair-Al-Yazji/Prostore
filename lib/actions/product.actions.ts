'use server';

import prisma from '@/db/prisma';
import type { Product } from '@/types';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import z from 'zod';
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from '../constants';
import { convertToPlainObject, formatError, formatId } from '../utils';
import { insertProductSchema, updateProductSchema } from '../validators';

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

export async function getProductById(productId: string) {
	const product = await prisma.product.findFirst({
		where: {
			id: productId,
		},
	});

	return convertToPlainObject(product);
}

// Get all product
export async function getAllProducts({
	limit = PAGE_SIZE,
	page,
	query,
	category,
}: {
	limit?: number;
	category?: string;
	page: number;
	query: string;
}) {
	const queryFilter: Prisma.ProductWhereInput =
		query && query !== 'all'
			? {
					name: {
						contains: query,
						mode: 'insensitive',
					} as Prisma.StringFilter,
			  }
			: {};

	const data = await prisma.product.findMany({
		where: { ...queryFilter },
		take: limit,
		skip: (page - 1) * limit,
		orderBy: { createdAt: 'desc' },
	});

	const dataCount = await prisma.product.count();

	return { data, totalPages: Math.ceil(dataCount / limit) };
}

// Delete a product
export async function deleteProduct(productId: string) {
	try {
		const existingProduct = await prisma.product.findFirst({
			where: { id: productId },
		});

		if (!existingProduct) throw new Error('Product not found');

		await prisma.product.delete({
			where: { id: productId },
		});

		revalidatePath('/admin/products');

		return { success: true, message: `${formatId(productId)} product deleted successfully` };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

// Create a product
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
	try {
		const product = insertProductSchema.parse(data);

		await prisma.product.create({
			data: product,
		});

		revalidatePath('/admin/products');

		return { success: true, message: 'Product created successfully' };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

// Update a product
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
	try {
		const product = updateProductSchema.parse(data);
		const productExists = await prisma.product.findFirst({
			where: { id: product.id },
		});

		if (!productExists) throw new Error('Product not found');

		await prisma.product.update({
			where: { id: product.id },
			data: product,
		});

		revalidatePath('/admin/products');

		return { success: true, message: 'Product updated successfully' };
	} catch (error) {
		return { success: false, message: formatError(error) };
	}
}

// Get all categories
export async function getAllCategories() {
	const data = (await prisma.product.groupBy({
		by: ['category'],
		_count: true,
	})) as { category: string; _count: number }[];

	return data;
}

// Get featured products
export async function getFeaturedProducts() {
	const data = await prisma.product.findMany({
		where: { isFeatured: true },
		orderBy: { createdAt: 'desc' },
		take: 4,
	});

	return convertToPlainObject(data);
}
