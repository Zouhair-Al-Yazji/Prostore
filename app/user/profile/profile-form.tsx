'use client';

import AvatarUpload from '@/components/admin/avatar-upload';
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
import { type FileWithPreview } from '@/hooks/use-file-upload';
import { updateProfile } from '@/lib/actions/user.actions';
import { useUploadThing } from '@/lib/uploadthing';
import { updateProfileSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export default function ProfileForm() {
	const { data: session, update } = useSession();
	const [avatar, setAvatar] = useState<FileWithPreview | null>();
	const router = useRouter();

	const {
		handleSubmit,
		control,
		reset,
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

	const { startUpload, isUploading } = useUploadThing('avatar', {
		onUploadError: err => {
			console.log(err.cause);
			toast.error('Error uploading file');
		},
	});

	async function onSubmit(data: z.infer<typeof updateProfileSchema>) {
		let image = data.image;

		if (avatar) {
			const res = await startUpload([avatar.file as File]);
			if (!res) {
				toast.error('Error uploading file');
				return;
			}
			image = res[0].ufsUrl;
		}

		const res = await updateProfile({ ...data, image });

		if (!res.success) {
			toast.error(res.message);
			return;
		}

		const updatedSession = await update({
			user: {
				name: data.name,
				image,
			},
		});

		if (updatedSession) {
			reset({
				email: updatedSession.user?.email ?? '',
				name: updatedSession.user?.name ?? '',
				image: updatedSession.user?.image ?? '',
			});
		}

		toast.success(res.message);
		router.refresh();
	}

	const image = watch('image');
	const isUpdating = isSubmitting || isUploading;

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
										disabled={isUpdating}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Field>
							<FieldLabel>Avatar</FieldLabel>
							<AvatarUpload defaultAvatar={image} onAvatarChange={setAvatar} />
							<input type="hidden" {...register('image')} />
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field>
					<Button type="submit" disabled={isUpdating} form="updateProfileForm">
						{isUpdating ? <Spinner className="h-4 w-4" /> : 'Update Profile'}
					</Button>
					<Button type="button" disabled={isUpdating} variant={'outline'} onClick={() => reset()}>
						Reset
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
