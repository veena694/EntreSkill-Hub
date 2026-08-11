import bcrypt from 'bcrypt';
import { IUser } from '../models/User';
import { getPrismaClient } from '../config/prisma';

export class UserRepository {
  private get prisma() {
    return getPrismaClient();
  }

  private async hashPasswordIfAny(userData: Partial<IUser>): Promise<Partial<IUser>> {
    const data = { ...userData };
    if (data.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(data.passwordHash, salt);
    }
    return data;
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const data = await this.hashPasswordIfAny(userData) as any;
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'user',
        isActive: data.isActive !== undefined ? data.isActive : true,
        isVerified: data.isVerified !== undefined ? data.isVerified : false,
        personalInfo: data.personalInfo || { fullName: '' },
        onboarding: data.onboarding || { skills: [], interests: [], budget: 0, experience: '', goals: [] },
        achievements: data.achievements || [],
        preferences: data.preferences || { notifications: true, darkMode: false, publicProfile: true },
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        deletedAt: data.deletedAt
      }
    }) as any;
  }

  async findById(id: string): Promise<IUser | null> {
    return this.prisma.user.findFirst({
      where: { id, isDeleted: false }
    }) as any;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), isDeleted: false }
    }) as any;
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    const data = await this.hashPasswordIfAny(updateData) as any;
    return this.prisma.user.update({
      where: { id },
      data
    }) as any;
  }

  async softDelete(id: string): Promise<IUser | null> {
    return this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      }
    }) as any;
  }
}

export default UserRepository;
