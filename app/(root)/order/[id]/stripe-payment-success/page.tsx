import { Button } from '@/components/ui/button';
import { getOrderById } from '@/lib/actions/order.actions';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function StripePaymentSuccessPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ payment_intent: string }>;
}) {
	const { id } = await params;
	const { payment_intent: paymentIntentId } = await searchParams;

	// Fetch Order
	const order = await getOrderById(id);
	if (!order) notFound();

	// Retrieve Payment intent
	const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

	// Check if payment intent is valid
	if (paymentIntent.metadata.orderId === null || paymentIntent.metadata.orderId !== order.id)
		notFound();

	// Check if payment is successful
	const isSuccess = paymentIntent.status === 'succeeded';

	if (!isSuccess) redirect(`/order/${id}`);

	return (
		<div className="max-w-4xl mx-auto w-full space-y-6">
			<div className="flex flex-col items-center gap-6">
				<h2 className="h2-bold">Thanks for your purchase</h2>
				<p>We are processing your order.</p>
				<Button asChild>
					<Link href={`/order/${order.id}`}>View order</Link>
				</Button>
			</div>
		</div>
	);
}
