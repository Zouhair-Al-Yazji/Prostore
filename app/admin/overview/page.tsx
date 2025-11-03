import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { getOrderSummery } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';
import { BadgeDollarSign, Barcode, CreditCard, ExternalLink, Users } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import Charts from './charts';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
	title: 'Admin Dashboard',
};

export default async function AdminOverviewPage() {
	await requireAdmin();

	const { usersCount, latestSales, ordersCount, productsCount, salesData, totalSales } =
		await getOrderSummery();

	return (
		<div className="space-y-[8px]">
			<h2 className="h2-bold">Dashboard</h2>
			<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<BadgeDollarSign />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(totalSales._sum.totalPrice?.toString() || 0)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Sales</CardTitle>
						<CreditCard />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatNumber(ordersCount)}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Customers</CardTitle>
						<Users />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatNumber(usersCount)}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Products</CardTitle>
						<Barcode />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{formatNumber(productsCount)}</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-7">
				<Card className="col-span-1 lg:col-span-4">
					<CardHeader>
						<CardTitle>Overview</CardTitle>
					</CardHeader>
					<CardContent>
						<Charts
							data={{
								salesData,
							}}
						/>
					</CardContent>
				</Card>

				<Card className="col-span-1 lg:col-span-3">
					<CardHeader>
						<CardTitle>Recent Sales</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>BUYER</TableHead>
									<TableHead>DATE</TableHead>
									<TableHead>TOTAL</TableHead>
									<TableHead>ACTIONS</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{latestSales.map(order => (
									<TableRow key={order.id}>
										<TableCell>{order?.user?.name ? order.user.name : 'Deleted User'}</TableCell>
										<TableCell>{formatDateTime(order.createdAt).formattedDate}</TableCell>
										<TableCell>{formatCurrency(order.totalPrice)}</TableCell>
										<TableCell>
											<Link href={`/order/${order.id}`} className="flex items-center">
												<ExternalLink className="w-4 h-4" />
												<span className="px-2">Details</span>
											</Link>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
