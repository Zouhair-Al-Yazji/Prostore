import { auth } from '@/auth';
import TitleStatus from '@/components/shared/title-status';
import { getUserById } from '@/lib/actions/user.actions';
import type { Metadata } from 'next';
import PaymentMethodForm from './payment-method-form';

export const metadata: Metadata = {
	title: 'Select Payment Method',
};

export default async function PaymentMethodPage() {
	const session = await auth();

	const userId = session?.user?.id;

	if (!userId) throw new Error('User not found');

	const user = await getUserById(userId);

	return (
		<>
			<TitleStatus current={3} />
			<PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
		</>
	);
}
