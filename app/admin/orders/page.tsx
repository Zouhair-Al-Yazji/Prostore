import AlertDeleteDialog from '@/components/shared/alert-delete-dialog';
import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { deleteOrderById, getAllOrders } from '@/lib/actions/order.actions';
import { requireAdmin } from '@/lib/auth-guard';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Admin Orders',
};

export default async function AdminOrdersPage({
	searchParams,
}: {
	searchParams: Promise<{ page: string }>;
}) {
	await requireAdmin();

	const { page = '1' } = await searchParams;

	const { data, totalPages } = await getAllOrders({ page: Number(page) });

	return (
		<div className="space-y-2">
			<h2 className="h2-bold">Orders</h2>
			<div className="overflow-x-auto space-y-4">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>DATE</TableHead>
							<TableHead>TOTAL</TableHead>
							<TableHead>PAID</TableHead>
							<TableHead>DELIVERED</TableHead>
							<TableHead>ACTIONS</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map(order => (
							<TableRow key={order.id}>
								<TableCell>{formatId(order.id)}</TableCell>
								<TableCell>{formatDateTime(order.createdAt).formattedDateTime}</TableCell>
								<TableCell>{formatCurrency(order.totalPrice)}</TableCell>
								<TableCell>
									{order.isPaid && order.paidAt ? (
										<div className="flex items-center gap-2">
											<Badge className="bg-green-600 text-green-50">PAID</Badge>
											{formatDateTime(order.paidAt).formattedDateTime}
										</div>
									) : (
										<Badge variant="destructive">NOT PAID</Badge>
									)}
								</TableCell>
								<TableCell>
									{order.isDelivered && order.deliveredAt ? (
										<div className="flex items-center gap-2">
											<Badge className="bg-green-600 text-white">DELIVERED</Badge>
											{formatDateTime(order.deliveredAt).formattedDateTime}
										</div>
									) : (
										<Badge variant="destructive">NOT DELIVERED</Badge>
									)}
								</TableCell>
								<TableCell className="flex items-center gap-2">
									<Button asChild variant="outline" size="sm">
										<Link href={`/order/${order.id}`} className="flex gap-0.5 items-center">
											<ExternalLink className="w-4 h-4" />
											<span className="px-2">Details</span>
										</Link>
									</Button>

									<AlertDeleteDialog onDelete={deleteOrderById} id={order.id} itemName="order" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				{totalPages > 1 && <Pagination page={Number(page) || 1} totalPages={totalPages} />}
			</div>
		</div>
	);
}
