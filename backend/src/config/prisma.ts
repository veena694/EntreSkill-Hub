import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://localhost:5432/entreskill_hub'
        }
      }
    });
  }
  return prisma;
};

export const resetPrismaClient = (newUrl: string): void => {
  if (prisma) {
    prisma.$disconnect().catch(() => {});
  }
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: newUrl
      }
    }
  });
};

export default getPrismaClient;
