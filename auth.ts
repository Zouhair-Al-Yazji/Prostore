import NextAuth, { type NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import { NextResponse } from 'next/server';

export const config = {
	pages: {
		signIn: '/sign-in',
		error: '/error',
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials) return null;

				// Find user in database
				const user = await prisma.user.findFirst({
					where: {
						email: credentials.email as string,
					},
				});

				// Check if the user exist and if the password matches
				if (user && user.password) {
					const isMatch = compareSync(credentials.password as string, user.password);

					// If password is correct return user
					if (isMatch) {
						return {
							id: user.id,
							name: user.name,
							email: user.email,
							role: user.role,
						};
					}
				}

				// If user does not exist or password does not match return null
				return null;
			},
		}),
	],
	callbacks: {
		async session({ session, token, user, trigger }: any) {
			// Set the user ID from the token
			session.user.id = token.sub;
			session.user.role = token.role;
			session.user.name = token.name;

			// if there an update, set the user name
			if (trigger === 'update') session.user.name = user.name;

			return session;
		},
		async jwt({ session, token, user, trigger }: any) {
			// Assign user field to token
			if (user) {
				token.role = user.role;

				// If user has no name then use the email
				if (user.name === 'NO_NAME') {
					token.name = user.email?.split('@')[0];

					// Update database to reflect the token name
					await prisma.user.update({
						where: { id: user.id },
						data: { name: token.name },
					});
				}
			}

			return token;
		},
		async authorized({ request, auth }) {
			// Check for session cart cookie
			if (!request.cookies.get('sessionCartId')) {
				// Generate new session cart id cookie
				const sessionCartId = crypto.randomUUID();

				// Clone the req headers
				const newRequestHeaders = new Headers(request.headers);

				// Create new response and add the new headers
				const response = NextResponse.next({
					request: {
						headers: newRequestHeaders,
					},
				});

				// Set newly generated sessionCartId in the response cookie
				response.cookies.set('sessionCartId', sessionCartId);

				return response;
			} else {
				return true;
			}
		},
	},
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
