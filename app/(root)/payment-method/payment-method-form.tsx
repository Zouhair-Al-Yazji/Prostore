'use client';

import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/lib/constants';
import { PaymentMethod } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { paymentMethodSchema } from '../../../lib/validators';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldContent,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
	FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { updateUserPaymentMethod } from '@/lib/actions/user.actions';
import { toast } from 'sonner';

export default function PaymentMethodForm({
	preferredPaymentMethod,
}: {
	preferredPaymentMethod: string | null;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { handleSubmit, control, reset } = useForm<PaymentMethod>({
		resolver: zodResolver(paymentMethodSchema),
		defaultValues: {
			type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
		},
	});

	async function onSubmit(data: PaymentMethod) {
		startTransition(async () => {
			const res = await updateUserPaymentMethod(data);
			if (!res.success) {
				toast.error(res.message);
				return;
			}

			router.push('/place-order');
		});
	}

	return (
		<>
			<Card className="w-full sm:max-w-md sm:mx-auto">
				<CardHeader>
					<CardTitle>Payment Method</CardTitle>
					<CardDescription>Please select a payment method.</CardDescription>
				</CardHeader>
				<CardContent>
					<form id="paymentMethodForm" onSubmit={handleSubmit(onSubmit)}>
						<FieldGroup>
							<Controller
								name="type"
								control={control}
								render={({ field, fieldState }) => (
									<FieldSet data-invalid={fieldState.invalid}>
										<RadioGroup
											name={field.name}
											value={field.value}
											onValueChange={field.onChange}
											aria-invalid={fieldState.invalid}
										>
											{PAYMENT_METHODS.map(paymentMethod => (
												<FieldLabel htmlFor={paymentMethod} key={paymentMethod}>
													<Field orientation="horizontal" data-invalid={fieldState.invalid}>
														<FieldContent>
															<FieldTitle>{paymentMethod}</FieldTitle>
														</FieldContent>
														<RadioGroupItem
															value={paymentMethod}
															id={paymentMethod}
															aria-invalid={fieldState.invalid}
														/>
													</Field>
												</FieldLabel>
											))}
										</RadioGroup>
										{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
									</FieldSet>
								)}
							/>
						</FieldGroup>
					</form>
				</CardContent>
				<CardFooter>
					<Field>
						<Button type="submit" disabled={isPending} form="paymentMethodForm">
							{isPending ? <Spinner className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{' '}
							Continue
						</Button>
						<Button type="button" disabled={isPending} variant={'outline'} onClick={() => reset()}>
							Reset
						</Button>
					</Field>
				</CardFooter>
			</Card>
		</>
	);
}
