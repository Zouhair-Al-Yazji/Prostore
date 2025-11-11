import Pagination from '@/components/shared/pagination';
import ProductCard from '@/components/shared/product/product-card';
import { Button } from '@/components/ui/button';
import { getAllCategories, getAllProducts } from '@/lib/actions/product.actions';
import Link from 'next/link';

const prices = [
	{ name: '$1 to $50', value: '1-50' },
	{ name: '$51 to $100', value: '51-100' },
	{ name: '$101 to $200', value: '101-200' },
	{ name: '$201 to $500', value: '200-500' },
	{ name: '$501 to $1000', value: '501-1000' },
];

const ratings = [1, 2, 3, 4];

const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

export async function generateMetadata({
	searchParams,
}: {
	searchParams: Promise<{ q: string; category: string; price: string; rating: string }>;
}) {
	const { category = 'all', q = 'all', price = 'all', rating = 'all' } = await searchParams;
	const isQuerySet = q && q !== 'all' && q.trim() !== '';
	const isCategorySet = category && category !== 'all' && category.trim() !== '';
	const isPriceSet = price && price !== 'all' && price !== '';
	const isRatingSet = rating && rating !== 'all' && rating !== '';

	if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
		return {
			title: `Search ${isQuerySet ? q : ''} ${isCategorySet ? `: Category ${category}` : ''} ${
				isPriceSet ? `: Price ${price}` : ''
			} ${isRatingSet ? `: Rating ${rating}` : ''}`,
		};
	} else {
		return {
			title: 'Search',
		};
	}
}

export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<{
		q?: string;
		category?: string;
		price?: string;
		rating?: string;
		page?: string;
		sort?: string;
	}>;
}) {
	const {
		category = 'all',
		q = 'all',
		price = 'all',
		rating = 'all',
		page = '1',
		sort = 'newest',
	} = await searchParams;

	// Construct filter url
	function getFilterUrl({
		c,
		p,
		r,
		s,
		pg,
	}: {
		c?: string;
		p?: string;
		s?: string;
		r?: string;
		pg?: string;
	}) {
		const params = { category, q, price, rating, page, sort };

		if (c) params.category = c;
		if (p) params.price = p;
		if (r) params.rating = r;
		if (s) params.sort = s;
		if (pg) params.page = pg;

		return `/search?${new URLSearchParams(params).toString()}`;
	}

	const { data, totalPages } = await getAllProducts({
		category,
		page: Number(page),
		query: q,
		price,
		rating,
		sort,
	});

	const categories = await getAllCategories();

	return (
		<div className="grid md:grid-cols-5 md:gap-5">
			<div className="filter-links">
				<h2 className="mb-2 mt-3 text-xl">Category</h2>
				<div>
					<ul className="space-y-1">
						<li>
							<Link
								href={getFilterUrl({ c: 'all' })}
								className={`${(category === 'all' || category === '') && 'font-bold'}`}
							>
								All
							</Link>
						</li>
						{categories.map(item => (
							<li key={item.category}>
								<Link
									href={getFilterUrl({ c: item.category })}
									className={`${category === item.category && 'font-bold'}`}
								>
									{item.category}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<h2 className="mb-2 mt-8 text-xl">Price</h2>
				<div>
					<ul className="space-y-1">
						<li>
							<Link
								href={getFilterUrl({ p: 'all' })}
								className={`${price === 'all' && 'font-bold'}`}
							>
								All
							</Link>
						</li>
						{prices.map(item => (
							<li key={item.value}>
								<Link
									href={getFilterUrl({ p: item.value })}
									className={`${price === item.value && 'font-bold'}`}
								>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<h2 className="mb-2 mt-8 text-xl">Customer Rating</h2>
				<div>
					<ul className="space-y-1">
						<li>
							<Link
								href={getFilterUrl({ r: 'all' })}
								className={`${rating === 'all' && 'font-bold'}`}
							>
								All
							</Link>
						</li>
						{ratings.map(r => (
							<li key={r}>
								<Link
									href={getFilterUrl({ r: r.toString() })}
									className={`${rating === r.toString() && 'font-bold'}`}
								>
									{`${r} stars & up`}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="md:col-span-4 space-y-4">
				<div className="flex-between flex-col md:flex-row my-4">
					<div className="flex items-center gap-1">
						<span>{q !== 'all' && q !== '' && 'Query: ' + q}</span>
						<span>{category !== 'all' && category !== '' && 'Category: ' + category}</span>
						<span>{price !== 'all' && 'Price: ' + price}</span>
						<span>{rating !== 'all' && 'Rating: ' + rating + ' starts & up'}</span>
						&nbsp;
						{(q !== 'all' && q !== '') ||
						(category !== 'all' && category !== '') ||
						price !== 'all' ||
						rating !== 'all' ? (
							<Button asChild size="sm" variant="outline">
								<Link href="/search">Clear Filter</Link>
							</Button>
						) : null}
					</div>

					<div>
						Sort By{' '}
						{sortOrders.map(s => (
							<Link
								className={`mx-2 ${s === sort && 'font-bold'}`}
								href={getFilterUrl({ s })}
								key={s}
							>
								{s}
							</Link>
						))}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{data.length === 0 && <div>No Products Found</div>}
					{data.map(product => (
						<ProductCard product={product} key={product.id} />
					))}
					{totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
				</div>
			</div>
		</div>
	);
}
