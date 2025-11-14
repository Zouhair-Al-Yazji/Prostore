'use client';

import { loadStripe } from '@stripe/stripe-js';
import {
	Elements,
	LinkAuthenticationElement,
	PaymentElement,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import { useTheme } from 'next-themes';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatCurrency } from '@/lib/utils';
import { SERVER_URL } from '@/lib/constants';

export default function StripePayment({
	orderId,
	clientSecret,
	priceInCents,
}: {
	orderId: string;
	clientSecret: string;
	priceInCents: number;
}) {
	const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
	const { theme, systemTheme } = useTheme();

	// Stripe Form Component
	function StripeForm() {
		const stripe = useStripe();
		const elements = useElements();

		const [isLoading, setIsLoading] = useState(false);
		const [errorMessage, setErrorMessage] = useState('');
		const [email, setEmail] = useState('');

		async function handleSubmit(e: FormEvent) {
			e.preventDefault();

			if (stripe === null || elements === null || email === null) return;

			setIsLoading(true);

			stripe
				.confirmPayment({
					elements,
					confirmParams: {
						return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
					},
				})
				.then(({ error }) => {
					if (error?.type === 'card_error' || error?.type === 'validation_error') {
						setErrorMessage(error?.message ?? 'An Unknown Error Occurred');
					} else if (error) {
						setErrorMessage('An Unknown Error Occurred');
					}
				})
				.finally(() => setIsLoading(false));
		}

		return (
			<form className="space-y-4" onSubmit={handleSubmit}>
				<h3 className="text-lg">Stripe Checkout</h3>
				{errorMessage && <p className="text-destructive">{errorMessage}</p>}
				<PaymentElement />

				<div>
					<LinkAuthenticationElement onChange={e => setEmail(e.value.email)} />
				</div>

				<Button
					className="w-full"
					size="lg"
					disabled={isLoading || stripe === null || elements === null}
				>
					{isLoading ? (
						<span className="flex items-center gap-1">
							<Spinner className="h-4 w-4" /> Purchasing
						</span>
					) : (
						`Purchase ${formatCurrency(priceInCents / 100)}`
					)}
				</Button>
			</form>
		);
	}

	return (
		<Elements
			stripe={stripePromise}
			options={{
				clientSecret,
				appearance: {
					theme:
						theme === 'light'
							? 'stripe'
							: theme === 'dark'
							? 'night'
							: systemTheme === 'light'
							? 'stripe'
							: 'night',
				},
			}}
		>
			<StripeForm />
		</Elements>
	);
}
