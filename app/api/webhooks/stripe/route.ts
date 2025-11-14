import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';

export async function POST(req: NextRequest) {
	// Build the webhook event
	const event = await Stripe.webhooks.constructEvent(
		await req.text(),
		req.headers.get('stripe-signature') as string,
		process.env.STRIPE_WEBHOOK_SECRET as string
	);

	// Check for successful payment
	if (event.type === 'charge.succeeded') {
		const { object } = event.data;

		// Update order status
		updateOrderToPaid({
			orderId: object.metadata.orderId,
			paymentResult: {
				id: object.metadata.orderId,
				status: 'COMPLETED',
				email_address: object.billing_details.email!,
				pricePaid: (object.amount / 100).toFixed(),
			},
		});

		return NextResponse.json({
			message: 'updatedOrderToPaid was successful',
		});
	}

	return NextResponse.json({
		message: 'even is not charge.succeeded',
	});
}
