import prisma from './prisma';
import { sampleDate } from './sample-data';

export async function main() {
	console.log('Start seeding...');

	await prisma.product.deleteMany();
	await prisma.account.deleteMany();
	await prisma.session.deleteMany();
	await prisma.verificationToken.deleteMany();
	await prisma.user.deleteMany();

	await prisma.product.createMany({ data: sampleDate.products });
	await prisma.user.createMany({ data: sampleDate.users });

	console.log('Database seeded successfully 🎉');
}

main();
