'use client';

import StarRating from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { formatCurrency } from '@/lib/utils';
import type { Cart, CartItem } from '@/types';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

export default function CartTable({ cart }: { cart?: Cart }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	if (!cart) {
		return (
			<div>
				Cart is empty. <Link href="/">Go shopping</Link>
			</div>
		);
	}

	async function handleRemoveFromCart(productId: string) {
		startTransition(async () => {
			const res = await removeItemFromCart(productId);
			if (!res.success) {
				toast.error(res.message);
				return;
			}

			toast.success(res.message);
			router.refresh();
		});
	}

	async function handleAddToCart(item: CartItem) {
		startTransition(async () => {
			const res = await addItemToCart(item);
			if (!res.success) {
				toast.error(res.message);
				return;
			}

			toast.success(res.message);
			router.refresh();
		});
	}

	return (
		<>
			<h1 className="py-4 h2-bold">Shopping Cart</h1>
			{!cart || cart.items.length === 0 ? (
				<div>
					Cart is empty. <Link href="/">Go shopping</Link>
				</div>
			) : (
				<div className="grid md:grid-cols-4 md:gap-5">
					<div className="overflow-x-auto md:col-span-3">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Item</TableHead>
									<TableHead className="text-center">Quantity</TableHead>
									<TableHead className="text-right">Price</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{cart.items.map(item => (
									<TableRow key={item.slug}>
										<TableCell>
											<Link href={`/product/${item.slug}`} className="flex items-center gap-2">
												<Image
													src={item.image}
													alt={`${item.name} product image`}
													width={50}
													height={50}
												/>
												<span>{item.name}</span>
											</Link>
										</TableCell>
										<TableCell className="flex-center gap-2">
											<Button
												variant={'outline'}
												disabled={isPending}
												type="button"
												onClick={() => handleRemoveFromCart(item.productId)}
											>
												{isPending ? <Spinner /> : <Minus className="h-4 w-4" />}
											</Button>
											<span>{item.qty}</span>
											<Button
												disabled={isPending}
												variant={'outline'}
												type="button"
												onClick={() => handleAddToCart(item)}
											>
												{isPending ? <Spinner /> : <Plus className="h-4 w-4" />}
											</Button>
										</TableCell>
										<TableCell className="text-right">${item.price}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<Card>
						<CardContent className="gap-4">
							<div className="pb-3 text-xl">
								Subtotal ({cart.items.reduce((acc, item) => acc + item.qty, 0)}):
								<span className="font-bold">{formatCurrency(cart.itemsPrice)}</span>
							</div>
							<Button
								className="w-full"
								disabled={isPending}
								onClick={() => startTransition(() => router.push('/shipping-address'))}
							>
								{isPending ? <Spinner /> : <ArrowRight className="h-4 w-4" />} Proceed to checkout
							</Button>
						</CardContent>
					</Card>
				</div>
			)}
		</>
	);
}
