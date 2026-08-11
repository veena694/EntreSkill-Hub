import { 
  RefreshToken as PrismaRefreshToken, 
  EmailVerificationToken as PrismaEmailVerificationToken, 
  PasswordResetToken as PrismaPasswordResetToken 
} from '@prisma/client';

export type IRefreshToken = PrismaRefreshToken;
export type IEmailVerificationToken = PrismaEmailVerificationToken;
export type IPasswordResetToken = PrismaPasswordResetToken;
