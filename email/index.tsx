import { Resend } from 'resend';
import dotenv from 'dotenv';
import type { Order } from '@/types';
import { APP_NAME, SENDER_EMAIL } from '@/lib/constants';
import PurchaseReceiptEmail from './purchase-receipt';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPurchaseReceipt({ order }: { order: Order }) {
	await resend.emails.send({
		from: `${APP_NAME} <${SENDER_EMAIL}>`,
		to: [order.user.email],
		subject: `Order Confirmation ${order.id}`,
		react: <PurchaseReceiptEmail order={order} />,
	});
}
