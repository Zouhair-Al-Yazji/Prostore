import { requireAdmin } from '@/lib/auth-guard';

export default async function OrdersPage() {
	await requireAdmin();

	return <div>page</div>;
}
