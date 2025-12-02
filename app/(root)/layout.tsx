import Footer from '@/components/footer';
import Header from '@/components/shared/header';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex flex-col h-screen">
			<SessionProvider refetchInterval={0} refetchOnWindowFocus={true}>
				<Header />
				<main className="flex-1 wrapper">{children}</main>
				<Footer />
			</SessionProvider>
		</div>
	);
}
