import { IRefreshToken, IEmailVerificationToken, IPasswordResetToken } from '../models/Token';
import { getPrismaClient } from '../config/prisma';

export class TokenRepository {
  private get prisma() {
    return getPrismaClient();
  }

  // Refresh Token Methods
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<IRefreshToken> {
    return this.prisma.refreshToken.create({
      data: { userId, token, expiresAt, isRevoked: false }
    });
  }

  async findRefreshToken(token: string): Promise<IRefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: { token, isRevoked: false }
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    // Prisma requires update to match a unique field, token is unique in our schema
    await this.prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true }
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true }
    });
  }

  // Email Verification Token Methods
  async createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<IEmailVerificationToken> {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId }
    });
    return this.prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt }
    });
  }

  async findEmailVerificationToken(token: string): Promise<IEmailVerificationToken | null> {
    return this.prisma.emailVerificationToken.findUnique({
      where: { token }
    });
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { token }
    });
  }

  // Password Reset Token Methods
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<IPasswordResetToken> {
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId }
    });
    return this.prisma.passwordResetToken.create({
      data: { userId, token, expiresAt }
    });
  }

  async findPasswordResetToken(token: string): Promise<IPasswordResetToken | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { token }
    });
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: { token }
    });
  }
}

export default TokenRepository;
