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
import { Textarea } from '@/components/ui/textarea';
import { reviewFormDefaultValues } from '@/lib/constants';
import { insertReviewSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

export default function ReviewForm({
	userId,
	productId,
	onReviewSubmitted,
}: {
	userId: string;
	productId: string;
	onReviewSubmitted?: () => void;
}) {
	const {
		reset,
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<z.infer<typeof insertReviewSchema>>({
		resolver: zodResolver(insertReviewSchema),
		defaultValues: reviewFormDefaultValues,
	});

	function onSubmit() {}

	return (
		<Dialog>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogTrigger asChild>
					<Button>Write a review</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-md">
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

					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>

						<Button type="submit">Submit</Button>
					</DialogFooter>
				</DialogContent>
			</form>
		</Dialog>
	);
}
