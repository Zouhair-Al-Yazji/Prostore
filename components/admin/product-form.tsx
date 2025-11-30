'use client';

import { FileWithPreview } from '@/hooks/use-file-upload';
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { productDefaultValues } from '@/lib/constants';
import { useUploadThing } from '@/lib/uploadthing';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { Product } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import slugify from 'slugify';
import { toast } from 'sonner';
import z from 'zod';
import SortableImageUpload from './sortable';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '../ui/field';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Spinner } from '../ui/spinner';
import { Textarea } from '../ui/textarea';
import BannerUpload from './banner-upload';

export default function ProductForm({
	type,
	product,
	productId,
}: {
	type: 'Create' | 'Update';
	product?: Product;
	productId?: string;
}) {
	const router = useRouter();
	const schema = type === 'Create' ? insertProductSchema : updateProductSchema;

	const [banner, setBanner] = useState<FileWithPreview | null>();
	const [progress, setProgress] = useState(0);

	const { isUploading, startUpload } = useUploadThing('imageUploader', {
		onClientUploadComplete: res => {
			setValue('banner', res[0].ufsUrl);
			setBanner(null);
			toast.success('Banner Uploaded Successfully');
		},
		onUploadError: err => {
			toast.error(err.message);
		},
		onUploadProgress: progress => {
			setProgress(progress);
		},
	});

	const {
		handleSubmit,
		reset,
		control,
		setValue,
		getValues,
		watch,
		register,
		formState: { isSubmitting },
	} = useForm<z.infer<typeof schema>>({
		resolver: zodResolver(schema),
		defaultValues: type === 'Create' ? productDefaultValues : product,
	});

	async function onSubmit(data: z.infer<typeof schema>) {
		// On create
		if (type === 'Create') {
			const res = await createProduct(data);

			if (!res.success) {
				toast.error(res.message);
			} else {
				toast.success(res.message);
				router.push('/admin/products');
			}
		}

		// On update
		if (type === 'Update') {
			if (!productId) {
				router.push('/admin/products');
				return;
			}

			const res = await updateProduct({ ...data, id: productId });

			if (!res.success) {
				toast.error(res.message);
			} else {
				toast.success(res.message);
				router.push('/admin/products');
			}
		}
	}

	const handleRemoveBanner = useCallback(() => {
		setValue('banner', '', { shouldDirty: true });
		setBanner(null);
	}, [setValue]);

	const images = watch('images');
	const isFeatured = watch('isFeatured');
	const watchedBanner = watch('banner');

	return (
		<form onSubmit={handleSubmit(onSubmit)} id="productForm" className="space-y-6">
			<FieldSet>
				<FieldGroup className="flex flex-col md:flex-row gap-5">
					{/* name */}
					<Controller
						name="name"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel data-invalid={fieldState.invalid} htmlFor="name">
									Name
								</FieldLabel>
								<Input
									{...field}
									id="name"
									aria-invalid={fieldState.invalid}
									placeholder="Enter product name"
									disabled={isSubmitting}
								/>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* slug */}
					<Controller
						name="slug"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel data-invalid={fieldState.invalid} htmlFor="slug">
									Slug
								</FieldLabel>

								<Input
									{...field}
									id="slug"
									aria-invalid={fieldState.invalid}
									placeholder="Enter slug"
									disabled={isSubmitting}
								/>

								<div>
									<Button
										type="button"
										disabled={isSubmitting}
										size="sm"
										className="bg-gray-600 cursor-pointer"
										onClick={() => {
											setValue('slug', slugify(getValues().name, { lower: true }));
										}}
									>
										Generate
									</Button>
								</div>

								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
				</FieldGroup>

				<FieldGroup className="flex flex-col md:flex-row gap-5">
					{/* category */}
					<Controller
						name="category"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel data-invalid={fieldState.invalid} htmlFor="category">
									Category
								</FieldLabel>
								<Input
									{...field}
									id="category"
									aria-invalid={fieldState.invalid}
									disabled={isSubmitting}
									placeholder="Enter category"
								/>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* brand */}
					<Controller
						name="brand"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel data-invalid={fieldState.invalid} htmlFor="brand">
									Brand
								</FieldLabel>
								<Input
									{...field}
									id="brand"
									aria-invalid={fieldState.invalid}
									placeholder="Enter brand"
									disabled={isSubmitting}
								/>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
				</FieldGroup>

				<FieldGroup className="flex flex-col md:flex-row gap-5">
					{/* price */}
					<Controller
						name="price"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel data-invalid={fieldState.invalid} htmlFor="price">
									Price
								</FieldLabel>
								<Input
									{...field}
									id="price"
									aria-invalid={fieldState.invalid}
									placeholder="Enter product price"
									disabled={isSubmitting}
								/>
								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>

					{/* stock */}
					<Controller
						name="stock"
						control={control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<FieldLabel data-invalid={fieldState.invalid} htmlFor="stock">
									Stock
								</FieldLabel>
								<Input
									{...field}
									type="number"
									min={0}
									id="stock"
									aria-invalid={fieldState.invalid}
									placeholder="Enter stock"
									disabled={isSubmitting}
									onChange={e => {
										const value =
											e.target.value === '' ? productDefaultValues.stock : Number(e.target.value);
										field.onChange(value);
									}}
								/>

								{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
							</Field>
						)}
					/>
				</FieldGroup>

				{/* images */}
				<Controller
					name="images"
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel data-invalid={fieldState.invalid} htmlFor="images">
								Product Images
							</FieldLabel>
							<Card>
								<CardContent className="space-y-2 mt-2">
									<div className="flex-start space-x-2">
										{/* Sortable Image Upload Component */}
										<SortableImageUpload
											value={field.value || []}
											onValueChange={field.onChange}
											onUploadComplete={uploadedImages => {
												console.log('All uploads completed:', uploadedImages);
											}}
										/>
									</div>
								</CardContent>
							</Card>

							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				{/* isFeatured */}
				<div className="space-y-3">
					<FieldLabel>Featured Product</FieldLabel>
					<Card>
						<CardContent>
							<Controller
								name="isFeatured"
								control={control}
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="mb-2"
										orientation="horizontal"
									>
										<Checkbox
											id="isFeatured"
											name={field.name}
											aria-invalid={fieldState.invalid}
											checked={field.value}
											onCheckedChange={field.onChange}
										/>

										<FieldLabel data-invalid={fieldState.invalid} htmlFor="isFeatured">
											Is Featured?
										</FieldLabel>

										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</Field>
								)}
							/>

							{isFeatured && (
								<>
									<BannerUpload
										defaultBanner={watchedBanner || ''}
										onBannerChange={setBanner}
										onRemove={handleRemoveBanner}
									/>
								</>
							)}

							{isFeatured && banner && (
								<Button
									className="mt-3"
									disabled={isUploading}
									type="button"
									onClick={() => startUpload([banner.file as File])}
								>
									{isUploading ? (
										<span className="flex items-center gap-1">
											<Spinner />
											Uploading
										</span>
									) : (
										'Upload Banner'
									)}
								</Button>
							)}

							{isFeatured && banner && isUploading && (
								<div className="my-4">
									<Progress value={progress} className="transition-all duration-300" />
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* description */}
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
								id="description"
								aria-invalid={fieldState.invalid}
								placeholder="Enter product description"
								disabled={isSubmitting}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>

				<Field>
					<Button
						type="submit"
						disabled={isSubmitting || isUploading}
						className="cursor-pointer"
						form="productForm"
					>
						{isSubmitting ? (
							type === 'Create' ? (
								<span className="flex items-center gap-1">
									<Spinner className="h-4 w-4" /> Creating Product
								</span>
							) : (
								<span className="flex items-center gap-1">
									<Spinner className="h-4 w-4" /> Updating Product
								</span>
							)
						) : (
							`${type} Product`
						)}
					</Button>
					<Button
						onClick={() => reset()}
						disabled={isSubmitting}
						className="cursor-pointer"
						variant="outline"
					>
						Reset
					</Button>
				</Field>
			</FieldSet>
		</form>
	);
}
