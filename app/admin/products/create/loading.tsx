import { Spinner } from '@/components/ui/spinner';

export default function loading() {
	return (
		<div className="flex justify-center my-20">
			<Spinner className="w-30 h-30" />
		</div>
	);
}
