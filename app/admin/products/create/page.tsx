import ProductForm from '@/components/admin/product-form';
import { requireAdmin } from '@/lib/auth-guard';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Create Product',
};

export default async function AdminCreateProductPage() {
	await requireAdmin();

	return (
		<>
			<h2 className="h2-bold">Create Product</h2>
			<div className="my-8">
				<ProductForm type="Create" />
			</div>
		</>
	);
}
