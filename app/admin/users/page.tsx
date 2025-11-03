import { requireAdmin } from '@/lib/auth-guard';

export default async function UsersPage() {
	await requireAdmin();

	return <div>page</div>;
}
