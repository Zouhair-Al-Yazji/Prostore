'use client';

import { Star } from 'lucide-react';
import { useCallback, useState } from 'react';

export default function StarRating({
	maxRating,
	defaultRating = 0,
	color = '#fbbf24',
	size = 24,
	onSetRatingAction,
}: {
	maxRating: number;
	color?: string;
	size?: number;
	defaultRating?: number;
	onSetRatingAction?: (rating: number) => void;
}) {
	const [rating, setRating] = useState(defaultRating);
	const [tempRating, setTempRating] = useState(0);

	const handleRating = useCallback(
		(starValue: number) => {
			const newRating = rating === starValue ? 0 : starValue;
			setRating(newRating);
			onSetRatingAction?.(newRating);
		},
		[rating, onSetRatingAction]
	);

	const handleMouseEnter = useCallback((starValue: number) => {
		setTempRating(starValue);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setTempRating(0);
	}, []);

	const activeRating = tempRating || rating;

	return (
		<div className="flex items-center gap-2">
			<div className="flex items-center gap-2">
				{Array.from({ length: maxRating }).map((_, i) => {
					const starValue = i + 1;
					const isActive = starValue <= activeRating;

					return (
						<Star
							key={starValue}
							size={size}
							role="button"
							aria-label={`Rate ${starValue} out of ${maxRating}`}
							tabIndex={0}
							onClick={() => handleRating(starValue)}
							onMouseEnter={() => handleMouseEnter(starValue)}
							onMouseLeave={handleMouseLeave}
							className={'cursor-pointer transition-colors'}
							style={{
								color: isActive ? color : 'currentColor',
								fill: isActive ? color : 'none',
								stroke: isActive ? color : 'currentColor',
							}}
						/>
					);
				})}
			</div>
			<p className="font-medium text-lg" style={{ color }}>
				{activeRating || ''}
			</p>
		</div>
	);
}
