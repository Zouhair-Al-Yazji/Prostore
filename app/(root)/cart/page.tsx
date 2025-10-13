import { getMyCart } from '@/lib/actions/cart.actions';
import type { Metadata } from 'next';
import CartTable from './cart-table';

export const metadata: Metadata = {
	title: 'Shopping Cart',
};

export default async function CartPage() {
	const cart = await getMyCart();

	return (
		<>
			<CartTable cart={cart} />
		</>
	);
}
