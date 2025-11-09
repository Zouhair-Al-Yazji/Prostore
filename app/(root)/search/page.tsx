export default async function SearchPage({
	searchParams,
}: {
	searchParams: Promise<{ category: string }>;
}) {
	const { category } = await searchParams;

	return <div>search page {category}</div>;
}
