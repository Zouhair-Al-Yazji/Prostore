'use client';

import { Review } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import ReviewForm from './review-form';

export default function ReviewList({
	userId,
	productId,
	productSlug,
}: {
	userId: string;
	productId: string;
	productSlug: string;
}) {
	const [reviews, setReviews] = useState<Review[]>([]);

	return (
		<div className="space-y-4">
			{reviews.length === 0 && <div>No reviews yet</div>}

			{userId ? (
				<ReviewForm userId={userId} productId={productId} />
			) : (
				<div>
					Please
					<Link
						href={`/sign-in?callbackUrl=/products/${productSlug}`}
						className="px-1 text-blue-700"
					>
						Sign in
					</Link>
					to write a review
				</div>
			)}

			<div className="flex flex-col gap-3">{/* REVIEW LIST */}</div>
		</div>
	);
}
