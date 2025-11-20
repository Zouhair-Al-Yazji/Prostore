import { auth } from '@/auth';
import SignInGithupButton from '@/components/shared/signin-github-button';
import SignInGoogleButton from '@/components/shared/signin-google-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_NAME } from '@/lib/constants';
import type { Route } from 'next';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import CredentialsSignInForm from './credentials-signin-form';

export const metadata: Metadata = {
	title: 'Sign In',
};

export default async function SignInPage({
	searchParams,
}: {
	searchParams: Promise<{ callbackUrl: string }>;
}) {
	const { callbackUrl } = await searchParams;
	const session = await auth();

	if (session) redirect((callbackUrl as Route) || '/');

	return (
		<div className="w-full px-4 max-w-md mx-auto">
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
					<CardTitle className="text-center">Sign In</CardTitle>
					<CardDescription className="text-center">Sign in to your account</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-2">
						<SignInGoogleButton />
						<SignInGithupButton />
					</div>
					<div className="relative my-6">
						<hr />
						<span className="absolute bg-white px-1 top-0 left-2/4 -translate-2/4 text-sm text-muted-foreground">
							or continue
						</span>
					</div>

					<CredentialsSignInForm />
				</CardContent>
			</Card>
		</div>
	);
}
