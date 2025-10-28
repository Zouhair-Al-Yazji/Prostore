import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import type { Order } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderDetailsTable({ order }: { order: Order }) {
	const {
		id,
		shippingAddress,
		orderitems,
		shippingPrice,
		itemsPrice,
		taxPrice,
		totalPrice,
		paymentMethod,
		isDelivered,
		isPaid,
		paidAt,
		deliveredAt,
	} = order;

	return (
		<>
			<h1 className="py-4 text-xl">Order {formatId(id)}</h1>
			<div className="grid md:grid-cols-3 gap-5">
				<div className="md:col-span-2 space-y-4 overflow-x-auto">
					<Card>
						<CardContent>
							<CardTitle className="pb-4">Payment Method</CardTitle>
							<p className="mb-2">{paymentMethod}</p>
							{isPaid ? (
								<Badge variant="secondary">
									Paid at {formatDateTime(paidAt!).formattedDateTime}
								</Badge>
							) : (
								<Badge variant="destructive">Not Paid</Badge>
							)}
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<CardTitle className="pb-4">Shipping Address</CardTitle>
							<p>{shippingAddress.fullName}</p>
							<p className="mb-2">
								{shippingAddress.streetAddress}, {shippingAddress.city},{' '}
								{shippingAddress.postalCode}, {shippingAddress.country}
							</p>
							{isDelivered ? (
								<Badge variant="secondary">
									Delivered at {formatDateTime(deliveredAt!).formattedDateTime}
								</Badge>
							) : (
								<Badge variant="destructive">Not delivered</Badge>
							)}
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
									{orderitems.map(item => (
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
								<p>{formatCurrency(itemsPrice)}</p>
							</div>
							<div className="flex justify-between">
								<p>Tax</p>
								<p>{formatCurrency(taxPrice)}</p>
							</div>
							<div className="flex justify-between">
								<p>Shipping</p>
								<p>{formatCurrency(shippingPrice)}</p>
							</div>
							<hr />
							<div className="flex justify-between">
								<p>Total</p>
								<p>{formatCurrency(totalPrice)}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
