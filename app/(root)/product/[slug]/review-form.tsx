'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { createUpdateReview, getReviewByProductId } from '@/lib/actions/review.actions';
import { reviewFormDefaultValues } from '@/lib/constants';
import { insertReviewSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export default function ReviewForm({
	userId,
	productId,
	onReviewSubmittedAction,
}: {
	userId: string;
	productId: string;
	onReviewSubmittedAction?: () => void;
}) {
	const {
		control,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<z.infer<typeof insertReviewSchema>>({
		resolver: zodResolver(insertReviewSchema),
		defaultValues: reviewFormDefaultValues,
	});

	const [open, setOpen] = useState(false);

	async function handleOpenForm() {
		setValue('productId', productId);
		setValue('userId', userId);

		const review = await getReviewByProductId({ productId });

		if (review) {
			setValue('title', review.title);
			setValue('description', review.description);
			setValue('rating', review.rating);
		}

		setOpen(true);
	}

	async function onSubmit(data: z.infer<typeof insertReviewSchema>) {
		const res = await createUpdateReview({ ...data, productId });

		if (!res.success) {
			return toast.error(res.message);
		}

		if (onReviewSubmittedAction) onReviewSubmittedAction();

		toast(res.message);

		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button onClick={handleOpenForm} className="mt-3">
					Write a Review
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogHeader>
						<DialogTitle>Write a review</DialogTitle>
						<DialogDescription>Share your thoughts with other customers</DialogDescription>
					</DialogHeader>

					<FieldGroup>
						<Controller
							name="title"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="title">
										Title
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										placeholder="Enter title"
										id="title"
										disabled={isSubmitting}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="description"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="description">
										Description
									</FieldLabel>
									<Textarea
										{...field}
										aria-invalid={fieldState.invalid}
										placeholder="Enter description"
										id="description"
										disabled={isSubmitting}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>

						<Controller
							name="rating"
							control={control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="rating">
										Rating
									</FieldLabel>
									<Select
										name={field.name}
										value={field.value.toString()}
										onValueChange={value => field.onChange(Number(value))}
										disabled={isSubmitting}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a rating" />
										</SelectTrigger>
										<SelectContent>
											{Array.from({ length: 5 }).map((_, index) => (
												<SelectItem key={index} value={(index + 1).toString()}>
													{index + 1} <StarIcon className="h-4 w-4" />
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</FieldGroup>

					<Field className="mt-4">
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>

							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Spinner className="h-4 w-4" /> Submitting
									</>
								) : (
									'Submit'
								)}
							</Button>
						</DialogFooter>
					</Field>
				</form>
			</DialogContent>
		</Dialog>
	);
}
