'use client';

import Image from 'next/image';
import logo from '@/public/images/logo.svg';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<Image src={logo} alt={`${APP_NAME} Logo`} width={48} height={48} priority />
			<div className="shadow-md p-6 rounded-lg text-center w-1/3">
				<h1 className="font-bold text-3xl mb-4">Not Found</h1>
				<p className="text-destructive">Could not find requested page</p>
				<Button
					variant={'outline'}
					className="mt-4 ml-2"
					onClick={() => (window.location.href = '/')}
				>
					Back to home
				</Button>
			</div>
		</div>
	);
}
