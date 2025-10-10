'use client';

import { Button } from '@/components/ui/button';
import { addItemToCart } from '@/lib/actions/cart.actions';
import type { CartItem } from '@/types';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AddToCart({ item }: { item: CartItem }) {
	const router = useRouter();

	async function handleAddToCart() {
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
	}

	return (
		<Button className="w-full" type="button" onClick={handleAddToCart}>
			<Plus /> Add to cart
		</Button>
	);
}
