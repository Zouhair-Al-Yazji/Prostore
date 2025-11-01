import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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
	providers: [
		CredentialsProvider({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials) return null;

				// Call your new API route
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: credentials.email,
						password: credentials.password,
					}),
				});

				if (!res.ok) {
					return null; // The API returned an error (e.g., 401 Unauthorized)
				}

				const user = await res.json();

				// If the API returns a user object, authentication was successful
				if (user) {
					return user;
				} else {
					return null;
				}
			},
		}),
	],
	callbacks: {
		// The session callback gets data from the JWT token
		async session({ session, token }: any) {
			if (token.sub && session.user) {
				session.user.id = token.sub;
				session.user.role = token.role as string; // Cast role to its type
			}
			return session;
		},
		// The JWT callback is called first, to create/update the token
		async jwt({ token, user, trigger, session }: any) {
			if (user) {
				// The user object comes from the `authorize` function
				token.sub = user.id;
				token.role = user.role;
			}

			// Handle session updates
			if (session?.user.name && trigger === 'update') {
				token.name = session.user.name;
			}

			return token;
		},

		// This authorized callback is fine as it doesn't use Prisma
		async authorized({ request, auth }) {
			const protectedPaths = [
				/\/shipping-address/,
				/\/payment-method/,
				/\/place-order/,
				/\/profile/,
				/\/user\/(.*)/,
				/\/order\/(.*)/,
				/\/admin/,
			];
			const { pathname } = request.nextUrl;

			if (!auth && protectedPaths.some(path => path.test(pathname))) {
				return false;
			}

			// Logic for sessionCartId is fine to keep here
			if (!request.cookies.get('sessionCartId')) {
				const sessionCartId = crypto.randomUUID();
				const response = NextResponse.next();
				response.cookies.set('sessionCartId', sessionCartId);
				return response;
			}

			return true;
		},
	},
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
