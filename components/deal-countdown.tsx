'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Static target date (replace with desired date)
const TARGET_DATE = new Date('2025-12-16T00:00:00');

// Function to calculate the time remaining
function calculateTimeRemaining(targetDate: Date) {
	const currentTime = new Date();
	const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);

	return {
		days: Math.floor(timeDifference / (24 * 60 * 60 * 1000)),
		hours: Math.floor((timeDifference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)),
		minutes: Math.floor((timeDifference % (60 * 60 * 1000)) / (60 * 1000)),
		seconds: Math.floor((timeDifference % (60 * 1000)) / 1000),
	};
}

export default function DealCountdown() {
	const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

	useEffect(() => {
		// Calculate initial time on client
		setTime(calculateTimeRemaining(TARGET_DATE));

		const timeInterval = setInterval(() => {
			const newTime = calculateTimeRemaining(TARGET_DATE);
			setTime(newTime);

			if (
				newTime.days === 0 &&
				newTime.hours === 0 &&
				newTime.minutes === 0 &&
				newTime.seconds === 0
			) {
				clearInterval(timeInterval);
			}

			return () => clearInterval(timeInterval);
		}, 1000);
	}, []);

	if (!time) {
		return (
			<section className="my-20 grid grid-cols-1 md:grid-cols-2">
				<div className="flex flex-col justify-center gap-2">
					<h3 className="text-2xl font-bold">Loading Countdown...</h3>
				</div>
			</section>
		);
	}

	if (time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
		return (
			<section className="my-20 grid grid-cols-1 md:grid-cols-2">
				<div className="flex flex-col justify-center gap-2">
					<h3 className="text-2xl font-bold">Deal Has Ended</h3>
					<p>This deal is no longer available. Check out our latest promotions!</p>
					<div className="text-center">
						<Button asChild>
							<Link href="/search">View Products</Link>
						</Button>
					</div>
				</div>
				<div className="flex justify-center">
					<Image src="/images/promo.jpg" width={300} height={200} alt="promotion image" />
				</div>
			</section>
		);
	}

	return (
		<section className="my-20 grid grid-cols-1 md:grid-cols-2">
			<div className="flex flex-col justify-center gap-2">
				<h3 className="text-2xl font-bold">Deal Of The Month</h3>
				<p>
					Get ready for a shopping experience like never before with our Deals of the month! Every
					purchase comes with exclusive perks and offer, making the month a celebration of savvy
					choices and amazing deals. Don&apos;t miss out 🎁🛒
				</p>
				<ul className="grid grid-cols-4">
					<StateBox label="Days" value={time.days} />
					<StateBox label="Hours" value={time.hours} />
					<StateBox label="Minutes" value={time.minutes} />
					<StateBox label="Seconds" value={time.seconds} />
				</ul>
				<div className="text-center">
					<Button asChild>
						<Link href="/search">View Products</Link>
					</Button>
				</div>
			</div>
			<div className="flex justify-center">
				<Image src="/images/promo.jpg" width={300} height={200} alt="promotion image" />
			</div>
		</section>
	);
}

function StateBox({ label, value }: { label: string; value: number }) {
	return (
		<li className="text-center w-full p-4">
			<p className="text-2xl font-bold">{value}</p>
			<p>{label}</p>
		</li>
	);
}
