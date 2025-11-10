import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { getAllCategories } from '@/lib/actions/product.actions';
import { SearchIcon } from 'lucide-react';

export default async function Search() {
	const categories = await getAllCategories();

	return (
		<form action="/search" method="GET">
			<div className="flex items-center gap-2 w-full max-w-sm">
				<Select name="category">
					<SelectTrigger className="w-44">
						<SelectValue placeholder="All" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem key="All" value="all">
							All
						</SelectItem>
						{categories.map(item => (
							<SelectItem key={item.category} value={item.category}>
								{item.category}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Input name="q" placeholder="Search..." className="md:w-24 lg:w-72" />

				<Button>
					<SearchIcon />
				</Button>
			</div>
		</form>
	);
}
