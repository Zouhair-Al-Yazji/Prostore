'use client';

import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { SignUpUser } from '@/lib/actions/user.actions';
import { signUpDefaultValues } from '@/lib/constants';
import { LockIcon, MailIcon, User } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function SignUpForm() {
	const [data, action, isPending] = useActionState(SignUpUser, {
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
						<FieldLabel htmlFor="name">Name</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<User />
							</InputGroupAddon>
							<InputGroupInput
								type="text"
								defaultValue={signUpDefaultValues.name}
								id="name"
								name="name"
								disabled={isPending}
								placeholder="Enter full name"
								required
							/>
						</InputGroup>
					</Field>
					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<MailIcon />
							</InputGroupAddon>
							<InputGroupInput
								type="email"
								defaultValue={signUpDefaultValues.email}
								id="email"
								name="email"
								disabled={isPending}
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
								defaultValue={signUpDefaultValues.password}
								type="password"
								id="password"
								placeholder="******"
								disabled={isPending}
								name="password"
								required
							/>
						</InputGroup>
					</Field>
					<Field>
						<FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<LockIcon />
							</InputGroupAddon>
							<InputGroupInput
								defaultValue={signUpDefaultValues.confirmPassword}
								type="password"
								id="confirmPassword"
								placeholder="******"
								name="confirmPassword"
								disabled={isPending}
								required
							/>
						</InputGroup>
					</Field>
					<Field>
						<Button disabled={isPending}>
							{isPending ? (
								<>
									<Spinner className="h-4 w-4" /> Submitting
								</>
							) : (
								'Sign Up'
							)}
						</Button>
					</Field>

					{data.message && !data.success && (
						<FieldError className="text-center">{data.message}</FieldError>
					)}

					<Field>
						<FieldDescription className="text-center">
							Already have an account? <Link href="/sign-in">Sign In</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</FieldSet>
		</form>
	);
}
