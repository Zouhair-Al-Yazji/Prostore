'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFormStatus } from 'react-dom';

export default function SignUpButton() {
	const { pending } = useFormStatus();

	return (
		<Button disabled={pending}>
			{pending ? (
				<>
					<Spinner /> Submitting
				</>
			) : (
				'Sign Up'
			)}
		</Button>
	);
}
