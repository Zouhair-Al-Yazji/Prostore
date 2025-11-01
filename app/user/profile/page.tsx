import { Metadata } from 'next';
import UpdateProfileForm from './profile-form';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

export const metadata: Metadata = {
	title: 'Customer Profile',
};

export default async function ProfilePage() {
	const session = await auth();

	return (
		<SessionProvider session={session}>
			<div className="max-w-md mx-auto space-y-4">
				<UpdateProfileForm />
			</div>
		</SessionProvider>
	);
}
