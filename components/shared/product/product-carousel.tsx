'use client';

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Product } from '@/types';
import AutoPlay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCarousel({ data }: { data: Product[] }) {
	return (
		<Carousel
			className="w-full mb-12"
			opts={{ loop: true }}
			plugins={[
				AutoPlay({
					delay: 10000,
					stopOnInteraction: true,
					stopOnMouseEnter: true,
				}),
			]}
		>
			<CarouselContent>
				{data.map(product => (
					<CarouselItem key={product.id}>
						<Link href={`/product/${product.slug}`}>
							<div className="mx-auto relative">
								<Image
									src={product.banner!}
									width={0}
									height={0}
									sizes="100vw"
									className="w-full h-auto"
									alt={`${product.name} banner image`}
								/>
								<div className="absolute inset-0 flex items-end justify-center">
									<h2 className="bg-gray-900/50 text-xl font-bold text-white px-2">
										{product.name}
									</h2>
								</div>
							</div>
						</Link>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	);
}
