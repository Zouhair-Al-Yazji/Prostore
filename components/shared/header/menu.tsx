import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import ModeToggle from './mode-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EllipsisVertical, ShoppingCart, UserIcon } from 'lucide-react';
import UserButton from './user-button';

export default function Menu() {
	return (
		<div className="flex justify-end gap-3">
			<nav className="hidden gap-2 md:flex">
				<ModeToggle />
				<Button asChild variant={'ghost'}>
					<Link href="/cart">
						<ShoppingCart /> Cart
					</Link>
				</Button>
				<UserButton />
			</nav>

			<nav className="md:hidden">
				<Sheet>
					<SheetTrigger asChild className="align-middle">
						<Button variant={'ghost'}>
							<EllipsisVertical />
						</Button>
					</SheetTrigger>

					<SheetContent>
						<SheetHeader>
							<SheetTitle>Menu</SheetTitle>
							<SheetDescription></SheetDescription>
						</SheetHeader>
						<div className="flex flex-col items-start gap-2 p-2">
							<ModeToggle />
							<Button asChild variant={'ghost'}>
								<Link href="/cart">
									<ShoppingCart /> Cart
								</Link>
							</Button>
							<UserButton />
						</div>
					</SheetContent>
				</Sheet>
			</nav>
		</div>
	);
}
