import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import Menu from './menu';
import CategoryDrawer from './category-drawer';
import Search from './search';

export default function Header() {
	return (
		<header className="border-b">
			<div className="wrapper flex-between">
				<div className="flex-start">
					<CategoryDrawer />
					<Link href="/" className="flex-start ml-4 gap-3">
						<Image
							src="/images/logo.svg"
							alt={`${APP_NAME} Logo`}
							width={48}
							height={48}
							priority
						/>
						<span className="hidden lg:block text-xl font-bold">{APP_NAME}</span>
					</Link>
				</div>

				<div className="hidden md:block">
					<Search />
				</div>

				<Menu />
			</div>
		</header>
	);
}
