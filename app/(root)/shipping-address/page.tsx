import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ShippingAddressForm from './shipping-address-form';
import type { ShippingAddress } from '@/types';
import TitleStatus from '@/components/shared/title-status';

export const metadata: Metadata = {
	title: 'Shipping Address',
};

export default async function ShippingAddressPage() {
	const cart = await getMyCart();

	if (!cart || cart.items.length === 0) redirect('/cart');

	const session = await auth();
	const userId = session?.user?.id;

	if (!userId) throw new Error('No user ID');

	const user = await getUserById(userId);

	return (
		<>
			<TitleStatus current={2} />
			<ShippingAddressForm address={user.address as ShippingAddress} />
		</>
	);
}
