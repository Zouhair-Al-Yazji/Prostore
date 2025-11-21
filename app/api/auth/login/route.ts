import { mergeAnonymousCartIntoUserCart } from '@/lib/actions/cart.actions';
import prisma from '@/db/prisma';
import { compareSync } from 'bcrypt-ts-edge';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
		}

		// 1. Find the user in the database
		const user = await prisma.user.findFirst({
			where: { email },
		});

		// 2. Check if user exists and password is correct
		if (user && user.password) {
			const isMatch = compareSync(password, user.password);

			if (isMatch) {
				const sessionCartId = (await cookies()).get('sessionCartId')?.value;
				if (sessionCartId && user) {
					await mergeAnonymousCartIntoUserCart(user.id, sessionCartId);
				}

				// Return the user object (without the password)
				return NextResponse.json({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					image: user.image,
				});
			}
		}

		return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
	} catch (error) {
		return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
	}
}
