'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import type { Cart, CartItem } from '@/types';
import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

export default function AddToCart({ cart, item }: { cart?: Cart; item: CartItem }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	async function handleAddToCart() {
		startTransition(async () => {
			const res = await addItemToCart(item);

			if (!res.success) {
				toast.error(res.message);
				return;
			}

			// Handle success add to cart
			toast(`${item.name} ${res.message}`, {
				action: {
					label: 'Go To Cart',
					onClick: () => router.push('/cart'),
				},
			});
		});
	}

	async function handleRemoveFromCart() {
		startTransition(async () => {
			const res = await removeItemFromCart(item.productId);

			if (!res.success) {
				toast.error(res.message);
				return;
			}

			// Handle success remove from cart
			toast.success(`${res.message}`);
		});
	}

	// Check if item exist in cart
	const existItem = cart && cart.items.find(itm => itm.productId === item.productId);

	return existItem ? (
		<div>
			<Button disabled={isPending} type="button" variant={'outline'} onClick={handleRemoveFromCart}>
				{isPending ? <Spinner className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
			</Button>
			<span className="px-2">{existItem.qty}</span>
			<Button disabled={isPending} type="button" variant={'outline'} onClick={handleAddToCart}>
				{isPending ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
			</Button>
		</div>
	) : (
		<Button disabled={isPending} className="w-full" type="button" onClick={handleAddToCart}>
			{isPending ? <Spinner /> : <Plus />} Add to cart
		</Button>
	);
}
