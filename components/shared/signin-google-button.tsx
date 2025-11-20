'use client';

import { useTransition } from 'react';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import { SignInWithGoogle } from '@/lib/actions/user.actions';
import { Chrome } from 'lucide-react';

export default function SignInGoogleButton() {
	const [isPending, startTransition] = useTransition();

	const handleSubmit = () => {
		startTransition(async () => {
			await SignInWithGoogle();
		});
	};

	return (
		<form action={handleSubmit}>
			<Button variant="outline" disabled={isPending} className="w-full">
				{isPending ? (
					<Spinner />
				) : (
					<span className="flex items-center gap-2">
						<Chrome /> Google
					</span>
				)}
			</Button>
		</form>
	);
}
