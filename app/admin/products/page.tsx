import { requireAdmin } from '@/lib/auth-guard';

export default async function ProductsPage() {
	await requireAdmin();

	return <div>page</div>;
}
