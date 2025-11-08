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
import { deleteUserById, getAllUsers } from '@/lib/actions/user.actions';
import { requireAdmin } from '@/lib/auth-guard';
import { formatId } from '@/lib/utils';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Admin Users',
};

export default async function AdminUsersPage({
	searchParams,
}: {
	searchParams: Promise<{ page: string }>;
}) {
	await requireAdmin();

	const { page = 1 } = await searchParams;
	const { data, totalPages } = await getAllUsers({ page: Number(page) });

	return (
		<div className="space-y-2">
			<h2 className="h2-bold">Users</h2>
			<div className="overflow-x-auto space-y-4">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>NAME</TableHead>
							<TableHead>EMAIL</TableHead>
							<TableHead>ROLE</TableHead>
							<TableHead className="w-[100px]">ACTIONS</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map(user => (
							<TableRow key={user.id}>
								<TableCell>{formatId(user.id)}</TableCell>
								<TableCell>{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									{user.role === 'admin' ? (
										<Badge>Admin</Badge>
									) : (
										<Badge variant="secondary">User</Badge>
									)}
								</TableCell>
								<TableCell className="flex items-center gap-1">
									<Button asChild variant="outline" size="sm">
										<Link href={`/admin/users/${user.id}`}>
											<Pencil className="h-4 w-4" />
											Edit
										</Link>
									</Button>

									<AlertDeleteDialog itemName="user" onDelete={deleteUserById} id={user.id} />
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
