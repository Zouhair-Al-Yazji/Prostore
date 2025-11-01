import Menu from '@/components/shared/header/menu';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import MainNav from './main-nav';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Search } from 'lucide-react';

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex flex-col">
			<div className="border-b container mx-auto">
				<div className="flex items-center h-16 px-4">
					<Link href="/">
						<Image src="/images/logo.svg" width={48} height={48} alt={APP_NAME} />
					</Link>
					<MainNav className="mx-6" />

					<div className="ml-auto flex items-center space-x-4">
						<div className="md:w-[100px] lg:w-[300px]">
							<InputGroup>
								<InputGroupInput placeholder="Search..." />
								<InputGroupAddon>
									<Search />
								</InputGroupAddon>
								<InputGroupAddon align="inline-end">12 results</InputGroupAddon>
							</InputGroup>
						</div>
						<Menu />
					</div>
				</div>
			</div>

			<main className="flex-1 container mx-auto pt-6 p-8 space-y-4">{children}</main>
		</div>
	);
}
