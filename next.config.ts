import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
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
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
