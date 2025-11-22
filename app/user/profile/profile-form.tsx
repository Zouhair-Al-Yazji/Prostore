'use client';

import AvatarUpload from '@/components/avatar-upload';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { updateProfile } from '@/lib/actions/user.actions';
import { updateProfileSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export default function ProfileForm() {
	const { data: session, update } = useSession();

	const {
		handleSubmit,
		control,
		reset,
		setValue,
		watch,
		register,
		formState: { isSubmitting },
	} = useForm<z.infer<typeof updateProfileSchema>>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues: {
			email: session?.user?.email ?? '',
			name: session?.user?.name ?? '',
			image: session?.user?.image ?? '',
		},
	});

	async function onSubmit(data: z.infer<typeof updateProfileSchema>) {
		const res = await updateProfile(data);

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		const newSession = {
			...session,
			user: {
				...session?.user,
				name: data.name,
				image: data.image,
			},
		};

		await update(newSession);
		toast.success(res.message);
	}

	const image = watch('image');

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>Update user profile</CardDescription>
			</CardHeader>
			<CardContent>
				<form id="updateProfileForm" onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="email"
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="email">
										Email
									</FieldLabel>
									<Input
										{...field}
										id="email"
										aria-invalid={fieldState.invalid}
										placeholder="Enter email"
										disabled
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="name">
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
						<Field>
							<FieldLabel>Avatar</FieldLabel>
							<AvatarUpload defaultAvatar={image} />
							<input type="hidden" {...register('image')} />
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field>
					<Button type="submit" disabled={isSubmitting} form="updateProfileForm">
						{isSubmitting ? <Spinner className="h-4 w-4" /> : 'Update Profile'}
					</Button>
					<Button type="button" disabled={isSubmitting} variant={'outline'} onClick={() => reset()}>
						Reset
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
