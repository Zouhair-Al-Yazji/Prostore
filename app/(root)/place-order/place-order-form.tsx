'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { createOrder } from '@/lib/actions/order.actions';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

export default function PlaceOrderForm() {
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();

		const res = await createOrder();
		console.log(res);

		if (res.redirectTo) router.push(res.redirectTo);
	}

	const PlaceOrderButton = function () {
		const { pending } = useFormStatus();

		return (
			<Button disabled={pending} className="w-full">
				{pending ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />} Place Order
			</Button>
		);
	};

	return (
		<form className="w-full" onSubmit={handleSubmit}>
			<PlaceOrderButton />
		</form>
	);
}
