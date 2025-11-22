import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		qualities: [100, 95, 90, 85, 80],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: `${process.env.UPLOADTHING_APPID}.ufs.sh`,
				pathname: '/f/**',
			},
			{
				protocol: 'https',
				hostname: 'utfs.io',
				pathname: '/f/**',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
		],
	},
};

export default nextConfig;
