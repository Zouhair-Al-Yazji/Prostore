import AddToCart from '@/components/shared/product/add-to-cart';
import ProductImages from '@/components/shared/product/product-images';
import ProductPrice from '@/components/shared/product/product-price';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug } from '@/lib/actions/product.actions';
import { notFound } from 'next/navigation';

export default async function ProductDetailsPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const product = await getProductBySlug(slug);
	if (!product) notFound();

	return (
		<>
			<section>
				<div className="grid grid-cods-1 md:grid-cols-5">
					<div className="col-span-2 p-5">
						<ProductImages images={product.images} />
					</div>
					<div className="col-span-2">
						<div className="flex flex-col gap-6">
							<p>
								{product.brand} {product.category}
							</p>
							<h1 className="h3-bold">{product.name}</h1>
							<p>
								{product.rating} of {product.numReviews} Reviews
							</p>
							<div className="flex flex-col sm:flex-row sm:items-center gap-3">
								<ProductPrice
									value={Number(product.price)}
									className="bg-green-100 text-green-700 rounded-full px-5 py-2 w-24"
								/>
							</div>
						</div>
						<div className="mt-10">
							<p className="font-semibold">Description</p>
							<p>{product.description}</p>
						</div>
					</div>
					<div>
						<Card className="p-0">
							<CardContent className="p-4">
								<div className="mb-2 flex justify-between">
									<p>Price</p>
									<div>
										<ProductPrice value={Number(product.price)} />
									</div>
								</div>
								<div className="mb-2 flex justify-between">
									<p>Status</p>
									<div>
										{product.stock > 0 ? (
											<Badge variant={'outline'}>In Stock</Badge>
										) : (
											<Badge variant={'destructive'}>Out of Stock</Badge>
										)}
									</div>
								</div>
								{product.stock > 0 && (
									<div className="flex-center">
										<AddToCart
											item={{
												productId: product.id,
												name: product.name,
												image: product.images![0],
												price: product.price,
												slug: product.slug,
												qty: 1,
											}}
										/>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</section>
		</>
	);
}
