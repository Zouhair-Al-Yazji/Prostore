import AlertDeleteDialog from '@/components/shared/alert-delete-dialog';
import Pagination from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { deleteProduct, getAllProducts } from '@/lib/actions/product.actions';
import { requireAdmin } from '@/lib/auth-guard';
import { formatCurrency, formatId } from '@/lib/utils';
import { Pencil } from 'lucide-react';
import Link from 'next/link';

export default async function AdminProductsPage({
	searchParams,
}: {
	searchParams: Promise<{ page: string; query: string; category: string }>;
}) {
	await requireAdmin();

	const { page = 1, category = '', query = '' } = await searchParams;
	const { data, totalPages } = await getAllProducts({
		page: Number(page),
		query,
		category,
	});

	return (
		<div className="space-y-2">
			<div className="flex-between">
				<h1 className="h1-bold">Products</h1>
				<Button asChild>
					<Link href="/admin/products/create">Create Product</Link>
				</Button>
			</div>

			<div className="space-y-2">
				<Table className="overflow-x-auto">
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>NAME</TableHead>
							<TableHead className="text-right">PRICE</TableHead>
							<TableHead>CATEGORY</TableHead>
							<TableHead>STOCK</TableHead>
							<TableHead>RATING</TableHead>
							<TableHead className="w-[100px]">ACTIONS</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map(product => (
							<TableRow key={product.id}>
								<TableCell>{formatId(product.id)}</TableCell>
								<TableCell>{product.name}</TableCell>
								<TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
								<TableCell>{product.category}</TableCell>
								<TableCell>
									<span className="px-2">{product.stock}</span>
								</TableCell>
								<TableCell>{product.rating}</TableCell>
								<TableCell align="right" className="flex items-center gap-1">
									<Button asChild variant="outline" size="sm">
										<Link href={`/admin/products/${product.id}`}>
											<Pencil className="h-4 w-4" />
											Edit
										</Link>
									</Button>
									<AlertDeleteDialog itemName="product" id={product.id} onDelete={deleteProduct} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
			</div>
		</div>
	);
}
