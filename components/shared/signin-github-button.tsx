'use client';

import { useTransition } from 'react';
import { Button } from '../ui/button';
import { Github } from 'lucide-react';
import { SignInWithGithub } from '@/lib/actions/user.actions';
import { Spinner } from '../ui/spinner';

export default function SignInGithupButton() {
	const [isPending, startTransition] = useTransition();

	function handleSubmit() {
		startTransition(async () => {
			await SignInWithGithub();
		});
	}

	return (
		<form action={handleSubmit}>
			<Button variant="outline" className="w-full">
				{isPending ? (
					<Spinner />
				) : (
					<span className="flex items-center gap-2">
						<Github /> Github
					</span>
				)}
			</Button>
		</form>
	);
}
