import ProductForm from '@/components/admin/product-form';
import { getProductById } from '@/lib/actions/product.actions';
import { requireAdmin } from '@/lib/auth-guard';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
	title: 'Update Product',
};

export default async function AdminProductUpdatePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requireAdmin();

	const { id } = await params;
	const product = await getProductById(id);

	if (!product) notFound();

	return (
		<div className="space-y-6 max-w-5xl mx-auto">
			<h2 className="h2-bold">Update Product</h2>
			<ProductForm type="Update" product={product} productId={id} />
		</div>
	);
}
