import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import Menu from './menu';

export default function Header() {
	return (
		<header className="border-b">
			<div className="wrapper flex-between">
				<div className="flex-start">
					<Link href="/" className="flex-start gap-3">
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
				<Menu />
			</div>
		</header>
	);
}
