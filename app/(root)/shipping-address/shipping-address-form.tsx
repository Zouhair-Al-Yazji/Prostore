'use client';

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
import { shippingAddressDefaultValues } from '@/lib/constants';
import { shippingAddressSchema } from '@/lib/validators';
import type { ShippingAddress } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function ShippingAddressForm({ address }: { address: ShippingAddress }) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { handleSubmit, control, reset } = useForm<ShippingAddress>({
		resolver: zodResolver(shippingAddressSchema),
		defaultValues: address || shippingAddressDefaultValues,
	});

	function onSubmit(data: ShippingAddress) {
		toast('You submitted the following values:', {
			description: (
				<pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
					<code>{JSON.stringify(data, null, 2)}</code>
				</pre>
			),
		});
	}

	return (
		<Card className="w-full sm:max-w-md sm:mx-auto">
			<CardHeader>
				<CardTitle>Shipping address</CardTitle>
				<CardDescription>Please enter an address to ship to.</CardDescription>
			</CardHeader>
			<CardContent>
				<form id="shippingAddressForm" onSubmit={handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="fullName"
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="fullName">
										Full name
									</FieldLabel>
									<Input
										{...field}
										id="fullName"
										aria-invalid={fieldState.invalid}
										placeholder="Enter full name"
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="country"
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="country">
										Country
									</FieldLabel>
									<Input
										{...field}
										id="country"
										aria-invalid={fieldState.invalid}
										placeholder="Enter country"
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="city"
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="city">
										City
									</FieldLabel>
									<Input
										{...field}
										id="city"
										aria-invalid={fieldState.invalid}
										placeholder="Enter city"
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="streetAddress"
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="streetAddress">
										Address
									</FieldLabel>
									<Input
										{...field}
										id="streetAddress"
										aria-invalid={fieldState.invalid}
										placeholder="Enter address"
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
						<Controller
							name="postalCode"
							control={control}
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel data-invalid={fieldState.invalid} htmlFor="postalCode">
										Postal Code
									</FieldLabel>
									<Input
										{...field}
										id="postalCode"
										aria-invalid={fieldState.invalid}
										placeholder="Enter postal code"
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			</CardContent>
			<CardFooter>
				<Field>
					<Button type="submit" disabled={isPending} form="shippingAddressForm">
						{isPending ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{' '}
						Continue
					</Button>
					<Button type="button" disabled={isPending} variant={'outline'} onClick={() => reset()}>
						Reset
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
