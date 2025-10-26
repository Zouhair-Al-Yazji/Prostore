import { NextResponse } from 'next/server';
import prisma from '@/db/prisma';
import { compareSync } from 'bcrypt-ts-edge';
import { cookies } from 'next/headers';

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
				// Handle cart merging logic
				const cookiesObject = await cookies();
				const sessionCartId = cookiesObject.get('sessionCartId')?.value;

				if (sessionCartId) {
					const sessionCart = await prisma.cart.findFirst({
						where: { sessionCartId },
					});

					if (sessionCart) {
						// Delete any existing cart for this user
						await prisma.cart.deleteMany({ where: { userId: user.id } });
						// Assign the session cart to the logged-in user
						await prisma.cart.update({
							where: { id: sessionCart.id },
							data: {
								userId: user.id,
								sessionCartId,
							},
						});
					}
				}

				// Return the user object (without the password)
				return NextResponse.json({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				});
			}
		}

		return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
	} catch (error) {
		return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
	}
}
