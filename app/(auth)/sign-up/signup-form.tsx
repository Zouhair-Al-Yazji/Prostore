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
import SignUpButton from './signup-button';

export default function SignUpForm() {
	const [data, action] = useActionState(SignUpUser, {
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
								placeholder="Zouhair elyazji"
								// required
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
								required
							/>
						</InputGroup>
					</Field>
					<Field>
						<SignUpButton />
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
