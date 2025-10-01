import { PrismaClient } from '@/app/generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createExtendedPrismaClient> | undefined;
};

// Function to create the extended client
function createExtendedPrismaClient() {
  const basePrisma = new PrismaClient().$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
    },
  });
  
  return basePrisma.$extends(withAccelerate());
}

const prisma = globalForPrisma.prisma ?? createExtendedPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;