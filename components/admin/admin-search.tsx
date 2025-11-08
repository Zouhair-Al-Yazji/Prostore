'use client';

import { Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export default function AdminSearch() {
	const pathname = usePathname();
	const formActionUrl = pathname.includes('/admin/users')
		? '/admin/users'
		: pathname.includes('/admin/orders')
		? '/admin/orders'
		: '/admin/products';

	const searchParams = useSearchParams();
	const [queryValue, setQueryValue] = useState(searchParams.get('query') || '');

	useEffect(() => {
		setQueryValue(searchParams.get('query') || '');
	}, [searchParams]);

	return (
		<form action={formActionUrl} method="GET">
			<InputGroup>
				<InputGroupInput
					value={queryValue}
					onChange={e => setQueryValue(e.target.value)}
					type="search"
					name="query"
					placeholder="Search..."
				/>
				<InputGroupAddon>
					<Search />
				</InputGroupAddon>
			</InputGroup>
			<Button className="sr-only">Search</Button>
		</form>
	);
}
