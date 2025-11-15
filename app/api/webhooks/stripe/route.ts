import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';

export async function POST(req: NextRequest) {
	const signature = req.headers.get('stripe-signature');

	if (!signature) {
		return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
	}

	if (!process.env.STRIPE_WEBHOOK_SECRET) {
		console.error('STRIPE_WEBHOOK_SECRET is missing');
		return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
	}

	try {
		const body = await req.text();
		// Build the webhook event
		const event = Stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET
		);

		// Check for successful payment
		if (event.type === 'charge.succeeded') {
			const charge = event.data.object;

			// Validate required metadata
			if (!charge.metadata?.orderId) {
				console.error('Missing orderId in charge metadata');
				return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
			}

			// Update order status
			await updateOrderToPaid({
				orderId: charge.metadata.orderId,
				paymentResult: {
					id: charge.metadata.orderId,
					status: 'COMPLETED',
					email_address: charge.billing_details.email!,
					pricePaid: (charge.amount / 100).toFixed(2),
				},
			});

			return NextResponse.json({
				received: true,
				message: 'updatedOrderToPaid was successful',
			});
		}

		return NextResponse.json({
			message: 'even is not charge.succeeded',
		});
	} catch (error) {
		console.error('Webhook error:', error);
		return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
	}
}
