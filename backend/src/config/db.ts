import dotenv from 'dotenv';
import { getPrismaClient } from './prisma';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    const prisma = getPrismaClient();
    await prisma.$connect();
    console.log('PostgreSQL database connected successfully via Prisma.');
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Please verify DATABASE_URL in your .env file points to a running PostgreSQL instance.');
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    const prisma = getPrismaClient();
    await prisma.$disconnect();
    console.log('Database disconnected successfully.');
  } catch (error) {
    console.error('Database disconnection error:', error);
  }
};
