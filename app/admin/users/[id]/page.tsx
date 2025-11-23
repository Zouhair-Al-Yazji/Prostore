import { getUserById } from '@/lib/actions/user.actions';
import { requireAdmin } from '@/lib/auth-guard';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import UpdateUserForm from './update-user-form';

export const metadata: Metadata = {
	title: 'Update User',
};

export default async function AdminUserUpdatePage({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();

	const { id } = await params;

	const { id: userId, email, name, role, image } = await getUserById(id);

	if (!userId) notFound();

	return (
		<div className="max-w-lg mx-auto space-y-4">
			<h2 className="h2-bold">Update User</h2>
			<UpdateUserForm
				user={{
					id: userId,
					email,
					name,
					role,
					image: image || '',
				}}
			/>
		</div>
	);
}
