import NextAuth, { type NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';
import Google from 'next-auth/providers/google';
import Github from 'next-auth/providers/github';

export const config = {
	pages: {
		signIn: '/sign-in',
		error: '/sign-in',
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
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
		Github({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }),
	],
	callbacks: {
		async signIn({ user, account }: any) {
			// Handle Google and Github sign-in - find or create user in your database
			if (account?.provider === 'google' || account?.provider === 'github') {
				try {
					const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/oauth`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							email: user.email,
							name: user.name,
							image: user.image,
						}),
					});

					if (res.ok) {
						const dbUser = await res.json();
						// Merge database user data with the auth user object
						user.id = dbUser.id;
						user.role = dbUser.role;
						return true;
					} else {
						return false;
					}
				} catch (error) {
					console.error('Google sign-in error:', error);
					return false;
				}
			}

			if (account?.provider === 'credentials') {
				return true;
			}

			return false;
		},
		// The JWT callback is called first, to create/update the token
		async jwt({ token, user, trigger, session }: any) {
			if (user) {
				// The user object comes from the `authorize` function
				token.sub = user.id;
				token.role = user.role || 'user';
				token.image = user.image;
			}

			// Handle session updates
			if (session?.user.name && trigger === 'update') {
				token.name = session.user.name;
			}

			return token;
		},

		// The session callback gets data from the JWT token
		async session({ session, token }: any) {
			if (token.sub && session.user) {
				session.user.id = token.sub;
				session.user.role = token.role as string;
				if (token.image) {
					session.user.image = token.image as string;
				}
			}

			return session;
		},
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

			// Admin route protection
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
