import Pagination from '@/components/shared/pagination';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { getMyOrders } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'My Orders',
};

export default async function OrdersPage({
	searchParams,
}: {
	searchParams: Promise<{ page: string }>;
}) {
	const { page } = await searchParams;

	const { data, totalPages } = await getMyOrders({ page: Number(page) || 1 });

	return (
		<div className="space-y-2">
			<h2 className="h2-bold">Orders</h2>
			<div className="overflow-x-auto">
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
											<Badge className="bg-green-500 text-green-50">PAID</Badge>
											{formatDateTime(order.paidAt).formattedDateTime}
										</div>
									) : (
										<Badge variant="destructive">NOT PAID</Badge>
									)}
								</TableCell>
								<TableCell>
									{order.isDelivered && order.deliveredAt ? (
										<div className="flex items-center gap-2">
											{formatDateTime(order.deliveredAt).formattedDateTime}
											<Badge className="bg-green-500 text-green-50">DELIVERED</Badge>
										</div>
									) : (
										<Badge variant="destructive">NOT DELIVERED</Badge>
									)}
								</TableCell>
								<TableCell>
									<Link href={`order/${order.id}`}>
										<span className="px-2">Details</span>
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					{totalPages > 1 && <Pagination page={Number(page) || 1} totalPages={totalPages} />}
				</Table>
			</div>
		</div>
	);
}
