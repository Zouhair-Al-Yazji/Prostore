'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Trash } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';

export default function AlertDeleteDialog({
	id,
	onDelete,
	itemName,
}: {
	id: string;
	onDelete: (id: string) => Promise<{ success: boolean; message: string }>;
	itemName?: string;
}) {
	const [isPending, startTransition] = useTransition();

	function handleDeleteClick() {
		startTransition(async () => {
			const res = await onDelete(id);
			if (!res?.success) {
				toast.error(res?.message);
				return;
			}
			toast.success(res.message);
		});
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild className="cursor-pointer">
				<Button variant="destructive" size="sm" disabled={isPending} aria-label="delete-action">
					{isPending ? (
						<Spinner className="h-4 w-4" />
					) : (
						<>
							<Trash className="w-4 h-4" />
							<span className="px-2">Delete</span>
						</>
					)}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely shure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the {itemName}.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending} className="cursor-pointer">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						disabled={isPending}
						className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 cursor-pointer"
						onClick={handleDeleteClick}
					>
						{isPending ? (
							<span className="flex gap-2 items-center">
								<Spinner className="h-4 w-4" /> Deleting
							</span>
						) : (
							'Delete'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
