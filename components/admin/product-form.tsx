'use client';

import { productDefaultValues } from '@/lib/constants';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';
import { Product } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import z from 'zod';

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

	const { handleSubmit, formState } = useForm<z.infer<typeof insertProductSchema>>({
		resolver: zodResolver(schema),
		defaultValues: type === 'Create' ? productDefaultValues : product,
	});

	function onSubmit(data: z.infer<typeof schema>) {}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="flex flex-col md:flex-row gap-5">
				{/* name */}
				{/* slug */}
			</div>
			<div className="flex flex-col md:flex-row gap-5">
				{/* category */}
				{/* brand */}
			</div>
			<div className="flex flex-col md:flex-row gap-5">
				{/* price */}
				{/* stock */}
			</div>
			<div className="upload-field flex flex-col md:flex-row gap-5">{/* images */}</div>
			<div className="upload-field">{/* is featured */}</div>
			<div>{/* description */}</div>
			<div>{/* submit */}</div>
		</form>
	);
}
