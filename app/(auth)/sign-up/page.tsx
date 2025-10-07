import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SignUpForm from './signup-form';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
	title: 'Sign Up',
};

export default async function SignUpPage({
	searchParams,
}: {
	searchParams: Promise<{ callbackUrl: string }>;
}) {
	const { callbackUrl } = await searchParams;
	const session = await auth();

	if (session) redirect(callbackUrl || '/');

	return (
		<div className="w-full px-4 py-6 max-w-md mx-auto">
			<Card>
				<CardHeader className="space-y-4">
					<Link href="/" className="flex-center">
						<Image
							src={'/images/logo.svg'}
							alt={`${APP_NAME} Image`}
							width={100}
							height={100}
							priority={true}
						/>
					</Link>
					<CardTitle className="text-center">Create Account</CardTitle>
					<CardDescription className="text-center">
						Enter your information below to sign up
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SignUpForm />
				</CardContent>
			</Card>
		</div>
	);
}
