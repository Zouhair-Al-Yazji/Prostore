'use client';

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
import {
	PayPalButtons,
	PayPalScriptProvider,
	usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import {
	approvePaypalOrder,
	createPaypalOrder,
	deliverOrder,
	updateOrderToPaidCOD,
} from '@/lib/actions/order.actions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function OrderDetailsTable({
	order,
	paypalClientId,
	isAdmin,
}: {
	order: Order;
	paypalClientId: string;
	isAdmin: boolean;
}) {
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

	function PrintLoadingState() {
		const [{ isPending, isRejected }] = usePayPalScriptReducer();
		let status = '';

		if (isPending) {
			status = 'Loading PayPal...';
		} else if (isRejected) {
			status = 'Error Loading PayPal';
		}

		return status;
	}

	async function handleCreatePayPalOrder() {
		const res = await createPaypalOrder(id);

		if (!res.success) {
			toast.error(res.message);
		}

		return res.data;
	}

	async function handleApprovePayPalOrder(data: { orderID: string }) {
		const res = await approvePaypalOrder(id, data);

		if (!res.success) {
			toast.error(res.message);
		} else if (res.success) {
			toast.success(res.message);
		}
	}

	// Button to mark order as paid
	function MarkAsPaidButton() {
		const [isPending, startTransition] = useTransition();

		function handleClick() {
			startTransition(async () => {
				const res = await updateOrderToPaidCOD(id);
				if (!res.success) {
					toast.error(res.success);
					return;
				}

				toast.success(res.message);
			});
		}

		return (
			<Button type="button" className="w-full" disabled={isPending} onClick={handleClick}>
				{isPending ? (
					<span className="flex gap-2 items-center">
						<Spinner className="h-4 w-4" /> Processing
					</span>
				) : (
					'Mark As Paid'
				)}
			</Button>
		);
	}
	// Button to mark order as delivered
	function MarkAsDeliveredButton() {
		const [isPending, startTransition] = useTransition();

		function handleClick() {
			startTransition(async () => {
				const res = await deliverOrder(id);
				if (!res.success) {
					toast.error(res.success);
					return;
				}

				toast.success(res.message);
			});
		}

		return (
			<Button type="button" className="w-full" disabled={isPending} onClick={handleClick}>
				{isPending ? (
					<span className="flex gap-2 items-center">
						<Spinner className="h-4 w-4" /> Processing
					</span>
				) : (
					'Mark As Delivered'
				)}
			</Button>
		);
	}

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
							<div className="overflow-x-auto">
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
							</div>
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
							{/* Paypal Payment */}
							{!isPaid && paymentMethod === 'PayPal' && (
								<div>
									<PayPalScriptProvider options={{ clientId: paypalClientId }}>
										<PrintLoadingState />
										<PayPalButtons
											createOrder={handleCreatePayPalOrder}
											onApprove={handleApprovePayPalOrder}
										/>
									</PayPalScriptProvider>
								</div>
							)}

							{/* Cash On Delivery */}
							{isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && <MarkAsPaidButton />}
							{isAdmin && isPaid && !isDelivered && <MarkAsDeliveredButton />}
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
