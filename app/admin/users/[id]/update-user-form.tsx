'use client';

import { Button } from '@/components/ui/button';
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
import { updateUser } from '@/lib/actions/user.actions';
import { USER_ROLES } from '@/lib/constants';
import { updateUserSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export default function UpdateUserForm({ user }: { user: z.infer<typeof updateUserSchema> }) {
	const router = useRouter();
	const {
		handleSubmit,
		control,
		reset,
		formState: { isSubmitting },
	} = useForm<z.infer<typeof updateUserSchema>>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: user,
	});

	async function onSubmit(data: z.infer<typeof updateUserSchema>) {
		try {
			const res = await updateUser({ ...data, id: data.id });

			if (!res.success) {
				toast.error(res.message);
			}

			toast.success(res.message);
			router.push('/admin/users');
		} catch (error) {
			toast.error((error as Error).message);
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<FieldGroup>
				<Controller
					name="email"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="email" data-invalid={fieldState.invalid}>
								Email
							</FieldLabel>
							<Input
								{...field}
								disabled
								id="email"
								aria-invalid={fieldState.invalid}
								placeholder="Enter email"
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					name="name"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="name" data-invalid={fieldState.invalid}>
								Name
							</FieldLabel>
							<Input
								{...field}
								id="name"
								aria-invalid={fieldState.invalid}
								placeholder="Enter name"
								disabled={isSubmitting}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Controller
					name="role"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor="role" data-invalid={fieldState.invalid}>
								Role
							</FieldLabel>
							<Select
								name={field.name}
								value={field.value.toString()}
								onValueChange={field.onChange}
								disabled={isSubmitting}
							>
								<SelectTrigger id="role" aria-invalid={fieldState.invalid}>
									<SelectValue placeholder="Select a role" />
								</SelectTrigger>
								<SelectContent>
									{USER_ROLES.map(role => (
										<SelectItem key={role} value={role}>
											{role.charAt(0).toUpperCase() + role.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
				<Field>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<span className="flex items-center gap-1">
								<Spinner className="h-4 w-4" /> Updating
							</span>
						) : (
							'Update User'
						)}
					</Button>
					<Button variant="outline" disabled={isSubmitting} onClick={() => reset()}>
						Reset
					</Button>
				</Field>
			</FieldGroup>
		</form>
	);
}
