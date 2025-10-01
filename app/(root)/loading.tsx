import Image from 'next/image';
import loader from '@/app/assets/loader.gif';

export default function LoadingPage() {
	return (
		<div className="h-full flex-center">
			<Image src={loader} alt="loading..." width={120} height={120} />
		</div>
	);
}
