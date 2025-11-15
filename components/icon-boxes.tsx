import { DollarSign, Headset, ShoppingBag, WalletCards } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export default function IconBoxes() {
	return (
		<div>
			<Card>
				<CardContent className="grid md:grid-cols-4 gap-4 p-4">
					<div className="space-y-2">
						<ShoppingBag />
						<p className="text-sm font-bold">Free Shipping</p>
						<p className="text-sm text-muted-foreground">Free shipping on orders above $100</p>
					</div>

					<div className="space-y-2">
						<DollarSign />
						<p className="text-sm font-bold">Mony Back Guarantee</p>
						<p className="text-sm text-muted-foreground">Within 30 days of purchase</p>
					</div>

					<div className="space-y-2">
						<WalletCards />
						<p className="text-sm font-bold">Flexible Payments</p>
						<p className="text-sm text-muted-foreground">Pay with credit card, Paypal or COD</p>
					</div>

					<div className="space-y-2">
						<Headset />
						<p className="text-sm font-bold">24/7 Support</p>
						<p className="text-sm text-muted-foreground">Get Support at any time</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
