import { cn } from '@/lib/utils';
import React from 'react';

export default function CheckoutSteps({ current = 0 }) {
	return (
		<div className="flex-between flex-col md:flex-row gap-2 mb-10">
			{['User Login', 'Shipping Address', 'Payment Method', 'Place Order'].map((step, i) => (
				<React.Fragment key={step}>
					<div
						className={cn(
							'p-2 w-52 rounded-full text-center text-sm',
							i === current ? 'bg-secondary' : ''
						)}
					>
						{step}
					</div>
					{step !== 'Place Order' && <hr className="w-16 border-t border-gray-300 mx-2" />}
				</React.Fragment>
			))}
		</div>
	);
}
