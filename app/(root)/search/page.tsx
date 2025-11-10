import Pagination from '@/components/shared/pagination';
import ProductCard from '@/components/shared/product/product-card';
import { getAllCategories, getAllProducts } from '@/lib/actions/product.actions';
import Link from 'next/link';

const prices = [
	{ name: '$1 to $50', value: '1-50' },
	{ name: '$51 to $100', value: '51-100' },
	{ name: '$101 to $200', value: '101-200' },
	{ name: '$201 to $500', value: '200-500' },
	{ name: '$501 to $1000', value: '501-1000' },
];

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

		console.log(params);

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
			</div>

			<div className="md:col-span-4 space-y-4">
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
