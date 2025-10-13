'use client';

import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { SignInWithCredentials } from '@/lib/actions/user.actions';
import { signInDefaultValues } from '@/lib/constants';
import { LockIcon, MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function CredentialsSignInForm() {
	const [data, action, isPending] = useActionState(SignInWithCredentials, {
		success: false,
		message: '',
	});

	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/';

	return (
		<form action={action}>
			<Input type="hidden" name="callbackUrl" value={callbackUrl} />
			<FieldSet>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<MailIcon />
							</InputGroupAddon>
							<InputGroupInput
								type="email"
								defaultValue={signInDefaultValues.email}
								id="email"
								disabled={isPending}
								name="email"
								placeholder="john@email.com"
								required
							/>
						</InputGroup>
					</Field>
					<Field>
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<LockIcon />
							</InputGroupAddon>
							<InputGroupInput
								defaultValue={signInDefaultValues.password}
								type="password"
								id="password"
								disabled={isPending}
								placeholder="******"
								name="password"
								required
							/>
						</InputGroup>
					</Field>
					<Field>
						<Button disabled={isPending}>
							{isPending ? (
								<>
									<Spinner className="h-4 w-4" /> Signing In
								</>
							) : (
								'Sign In'
							)}
						</Button>
					</Field>

					{data.message && !data.success && (
						<FieldError className="text-center">{data.message}</FieldError>
					)}

					<Field>
						<FieldDescription className="text-center">
							Don&apos;t have an account? <Link href="/sign-up">Sign Up</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</FieldSet>
		</form>
	);
}
