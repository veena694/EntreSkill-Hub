import { IMentor } from '../models/Mentor';
import { getPrismaClient } from '../config/prisma';

export class MentorRepository {
  private get prisma() {
    return getPrismaClient();
  }

  private mapMentor(mentor: any) {
    if (!mentor) return null;
    return {
      ...mentor,
      _id: mentor.id,
      userId: mentor.user ? {
        ...mentor.user,
        _id: mentor.userId,
        id: mentor.userId
      } : mentor.userId
    };
  }

  async create(mentorData: Partial<IMentor>): Promise<IMentor> {
    const data = mentorData as any;
    const mentor = await this.prisma.mentor.create({
      data: {
        userId: data.userId,
        specialization: data.specialization,
        skills: data.skills || [],
        languages: data.languages || [],
        availability: data.availability || [],
        rating: data.rating !== undefined ? data.rating : 5.0,
        reviewsCount: data.reviewsCount !== undefined ? data.reviewsCount : 0,
        isVerified: data.isVerified !== undefined ? data.isVerified : false,
        documents: data.documents || [],
        socialLinks: data.socialLinks || { linkedin: '', website: '' },
        ratePerHour: data.ratePerHour !== undefined ? data.ratePerHour : 0,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false
      }
    });
    return this.mapMentor(mentor) as any;
  }

  async findById(id: string): Promise<IMentor | null> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: true
      }
    });
    return this.mapMentor(mentor) as any;
  }

  async findByUserId(userId: string): Promise<IMentor | null> {
    const mentor = await this.prisma.mentor.findFirst({
      where: { userId, isDeleted: false }
    });
    return this.mapMentor(mentor) as any;
  }

  async findAllActive(): Promise<IMentor[]> {
    const mentors = await this.prisma.mentor.findMany({
      where: { isDeleted: false, isVerified: true },
      include: {
        user: true
      }
    });
    return mentors.map(m => this.mapMentor(m)) as any;
  }

  async update(id: string, updateData: Partial<IMentor>): Promise<IMentor | null> {
    const data = updateData as any;
    const mentor = await this.prisma.mentor.update({
      where: { id },
      data
    });
    return this.mapMentor(mentor) as any;
  }

  async verifyMentor(id: string): Promise<IMentor | null> {
    const mentor = await this.prisma.mentor.update({
      where: { id },
      data: { isVerified: true }
    });
    return this.mapMentor(mentor) as any;
  }

  async softDelete(id: string): Promise<IMentor | null> {
    const mentor = await this.prisma.mentor.update({
      where: { id },
      data: { isDeleted: true }
    });
    return this.mapMentor(mentor) as any;
  }
}

export default MentorRepository;
