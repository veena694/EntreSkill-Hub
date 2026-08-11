import crypto from 'crypto';
import bcrypt from 'bcrypt';
import UserRepository from '../repositories/UserRepository';
import TokenRepository from '../repositories/TokenRepository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mail';
import { IUser } from '../models/User';
import { UserRole } from '../constants';

export class AuthService {
  private userRepo = new UserRepository();
  private tokenRepo = new TokenRepository();

  async register(email: string, passwordHash: string, fullName: string, role: UserRole = UserRole.USER): Promise<IUser> {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const user = await this.userRepo.create({
      email,
      passwordHash,
      role,
      personalInfo: { fullName, phoneNumber: null, location: null, profilePicture: null, bio: null },
      onboarding: { skills: [], interests: [], budget: 0, experience: '', goals: [] }
    });

    // Verification token valid for 24h
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.tokenRepo.createEmailVerificationToken(user.id, token, expiresAt);
    
    await sendVerificationEmail(email, token);
    return user;
  }

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account deactivated');
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Refresh token valid for 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.tokenRepo.createRefreshToken(user.id, refreshToken, expiresAt);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await this.tokenRepo.findRefreshToken(token);
    if (!stored) {
      throw new Error('Invalid or revoked refresh token');
    }

    // Verify token structure and validity
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      await this.tokenRepo.revokeRefreshToken(token);
      throw new Error('Invalid refresh token');
    }

    // Revoke old token and rotate (Token Rotation Security)
    await this.tokenRepo.revokeRefreshToken(token);

    const newPayload = { userId: payload.userId, email: payload.email, role: payload.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.tokenRepo.createRefreshToken(payload.userId, newRefreshToken, expiresAt);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string): Promise<void> {
    await this.tokenRepo.revokeRefreshToken(token);
  }

  async logoutAllDevices(userId: string): Promise<void> {
    await this.tokenRepo.revokeAllUserRefreshTokens(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const verification = await this.tokenRepo.findEmailVerificationToken(token);
    if (!verification) {
      throw new Error('Invalid or expired verification token');
    }

    await this.userRepo.update(verification.userId.toString(), { isVerified: true });
    await this.tokenRepo.deleteEmailVerificationToken(token);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return; // Silent error to prevent account enum attacks

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour validity
    await this.tokenRepo.createPasswordResetToken(user.id, token, expiresAt);

    await sendPasswordResetEmail(email, token);
  }

  async resetPassword(token: string, passwordHash: string): Promise<void> {
    const reset = await this.tokenRepo.findPasswordResetToken(token);
    if (!reset) {
      throw new Error('Invalid or expired password reset token');
    }

    // Update password (pre-save hook will re-hash this if mapped correctly, but User pre-save hashes passwordHash!)
    await this.userRepo.update(reset.userId.toString(), { passwordHash });
    await this.tokenRepo.deletePasswordResetToken(token);
    await this.tokenRepo.revokeAllUserRefreshTokens(reset.userId.toString()); // Force logout on reset
  }

  async changePassword(userId: string, currentPass: string, newPassHash: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new Error('Incorrect current password');
    }

    await this.userRepo.update(userId, { passwordHash: newPassHash });
    await this.tokenRepo.revokeAllUserRefreshTokens(userId);
  }

  async deactivateAccount(userId: string): Promise<void> {
    await this.userRepo.update(userId, { isActive: false });
    await this.tokenRepo.revokeAllUserRefreshTokens(userId);
  }
}
export default AuthService;
