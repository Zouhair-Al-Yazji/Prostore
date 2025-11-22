import { mergeAnonymousCartIntoUserCart } from '@/lib/actions/cart.actions';
import prisma from '@/db/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const { email, name, image, provider } = await req.json();

		if (!email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 400 });
		}

		let user = await prisma.user.findFirst({
			where: { email },
		});

		if (!user) {
			let optimizedImage = image;
			if (provider === 'google') {
				optimizedImage = image.split('=')[0];
				console.log(provider);
			}
			// Create new user for google or github sign-in
			user = await prisma.user.create({
				data: {
					email,
					image: optimizedImage,
					name,
					role: 'user',
					emailVerified: new Date(),
				},
			});
		} else {
			// Update existing user with Google or Githup data if needed
			if (!user.image && image) {
				let optimizedImage = image;
				if (provider === 'google') {
					optimizedImage = image.split('=')[0];
				}

				user = await prisma.user.update({
					where: { email },
					data: { image: optimizedImage, emailVerified: new Date() },
				});
			}
		}

		const sessionCartId = (await cookies()).get('sessionCartId')?.value;

		if (sessionCartId && user) {
			await mergeAnonymousCartIntoUserCart(user.id, sessionCartId);
		}

		return NextResponse.json({
			id: user.id,
			email: user.email,
			name: user.name,
			image: user.image,
			role: user.role,
		});
	} catch (error) {
		return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
	}
}
