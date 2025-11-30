import { auth } from '@/auth';
import TitleStatus from '@/components/shared/title-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { formatCurrency } from '@/lib/utils';
import type { ShippingAddress } from '@/types';
import { PencilIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PlaceOrderForm from './place-order-form';

export const metadata: Metadata = {
	title: 'Place Order',
};

export default async function PlaceOrderPage() {
	const cart = await getMyCart();
	const session = await auth();
	const userId = session?.user?.id;

	if (!userId) throw new Error('User not found');

	const user = await getUserById(userId);

	if (!cart || cart.items.length === 0) redirect('/cart');

	if (!user.address) redirect('/shipping-address');
	if (!user.paymentMethod) redirect('/payment-method');

	const userAddress = user.address as ShippingAddress;

	return (
		<>
			<TitleStatus current={4} />
			<h1 className="py-4 text-2xl">Place Order</h1>
			<div className="grid md:grid-cols-3 gap-5">
				<div className="md:col-span-2 space-y-4">
					<Card>
						<CardContent>
							<CardTitle className="pb-4">Shipping Address</CardTitle>
							<p>{userAddress.fullName}</p>
							<p>
								{userAddress.streetAddress}, {userAddress.city} {userAddress.postalCode},{' '}
								{userAddress.country}{' '}
							</p>
							<div className="mt-3">
								<Link href="/shipping-address">
									<Button variant="outline">
										<PencilIcon />
										Edit
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<CardTitle className="pb-4">Payment Method</CardTitle>
							<p>{user.paymentMethod}</p>
							<div className="mt-3">
								<Link href="/payment-method">
									<Button variant="outline">
										<PencilIcon />
										Edit
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<CardTitle className="pb-4">Order Items</CardTitle>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Item</TableHead>
										<TableHead>Quantity</TableHead>
										<TableHead>Price</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{cart.items.map(item => (
										<TableRow key={item.slug}>
											<TableCell>
												<Link href={`/product/${item.slug}`} className="flex items-center">
													<Image src={item.image} alt={item.name} width={50} height={50} />
													<span className="px-2">{item.name}</span>
												</Link>
											</TableCell>
											<TableCell>
												<span className="px-2">{item.qty}</span>
											</TableCell>
											<TableCell>
												<span className="px-2">${item.price}</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
				<div>
					<Card>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<p>Items</p>
								<p>{formatCurrency(cart.itemsPrice)}</p>
							</div>
							<div className="flex justify-between">
								<p>Tax</p>
								<p>{formatCurrency(cart.taxPrice)}</p>
							</div>
							<div className="flex justify-between">
								<p>Shipping</p>
								<p>{formatCurrency(cart.shippingPrice)}</p>
							</div>
							<hr />
							<div className="flex justify-between">
								<p>Total</p>
								<p>{formatCurrency(cart.totalPrice)}</p>
							</div>

							<PlaceOrderForm />
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
