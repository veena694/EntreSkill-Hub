import UserRepository from '../repositories/UserRepository';
import ProgressRepository from '../repositories/ProgressRepository';
import BookingRepository from '../repositories/BookingRepository';
import BusinessIdeaRepository from '../repositories/BusinessIdeaRepository';
import { IUser } from '../models/User';

export class UserService {
  private userRepo = new UserRepository();
  private progressRepo = new ProgressRepository();
  private bookingRepo = new BookingRepository();
  private ideaRepo = new BusinessIdeaRepository();

  async getProfile(userId: string): Promise<IUser | null> {
    return this.userRepo.findById(userId);
  }

  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    // Whitelist updates to protect roles and authentication details
    const cleanUpdate: any = {};
    if (updateData.personalInfo) {
      cleanUpdate.personalInfo = {
        fullName: updateData.personalInfo.fullName,
        phoneNumber: updateData.personalInfo.phoneNumber,
        location: updateData.personalInfo.location,
        bio: updateData.personalInfo.bio,
        profilePicture: updateData.personalInfo.profilePicture
      };
    }
    if (updateData.onboarding) {
      cleanUpdate.onboarding = {
        skills: updateData.onboarding.skills,
        interests: updateData.onboarding.interests,
        budget: updateData.onboarding.budget,
        experience: updateData.onboarding.experience,
        goals: updateData.onboarding.goals
      };
    }
    if (updateData.preferences) {
      cleanUpdate.preferences = {
        notifications: updateData.preferences.notifications,
        darkMode: updateData.preferences.darkMode,
        publicProfile: updateData.preferences.publicProfile
      };
    }

    return this.userRepo.update(userId, cleanUpdate);
  }

  async completeOnboarding(userId: string, onboardingData: {
    skills: string[];
    interests: string[];
    budget: number;
    experience: string;
    goals: string[];
  }): Promise<IUser | null> {
    return this.userRepo.update(userId, {
      onboarding: onboardingData,
      onboardingCompleted: true
    } as any);
  }

  async getDashboardData(userId: string): Promise<any> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const progress = await this.progressRepo.findByUserId(userId) || {
      roadmapProgress: [],
      learningProgress: [],
      totalLearningHours: 0,
      certificates: []
    };

    const bookings = await this.bookingRepo.findByUser(userId);

    // Calculate analytics metrics
    const activeRoadmapsCount = progress.roadmapProgress.filter(rp => !rp.isCompleted).length;
    const completedRoadmapsCount = progress.roadmapProgress.filter(rp => rp.isCompleted).length;
    const completedCoursesCount = progress.learningProgress.filter(lp => lp.isCompleted).length;

    return {
      fullName: user.personalInfo.fullName,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
      activeRoadmapsCount,
      completedRoadmapsCount,
      completedCoursesCount,
      totalLearningHours: progress.totalLearningHours,
      latestBookings: bookings.slice(0, 3),
      roadmapProgressSummary: progress.roadmapProgress.map(rp => ({
        roadmapId: rp.roadmapId,
        percentageComplete: rp.percentageComplete,
        isCompleted: rp.isCompleted
      })),
      certificatesEarned: progress.certificates
    };
  }

  async exportUserData(userId: string): Promise<string> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const progress = await this.progressRepo.findByUserId(userId);
    const bookings = await this.bookingRepo.findByUser(userId);

    const exportBundle = {
      user: {
        email: user.email,
        personalInfo: user.personalInfo,
        onboarding: user.onboarding,
        achievements: user.achievements,
        createdAt: user.createdAt
      },
      progress,
      bookings
    };

    return JSON.stringify(exportBundle, null, 2);
  }

  async addBookmark(userId: string, ideaId: string): Promise<string[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const currentBookmarks = (user.bookmarks || []) as string[];
    if (!currentBookmarks.includes(ideaId)) {
      currentBookmarks.push(ideaId);
      await this.userRepo.update(userId, { bookmarks: currentBookmarks } as any);
      await this.ideaRepo.incrementBookmarkCount(ideaId, 1);
    }
    return currentBookmarks;
  }

  async removeBookmark(userId: string, ideaId: string): Promise<string[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    let currentBookmarks = (user.bookmarks || []) as string[];
    if (currentBookmarks.includes(ideaId)) {
      currentBookmarks = currentBookmarks.filter(id => id !== ideaId);
      await this.userRepo.update(userId, { bookmarks: currentBookmarks } as any);
      await this.ideaRepo.incrementBookmarkCount(ideaId, -1);
    }
    return currentBookmarks;
  }

  async getUserBookmarks(userId: string): Promise<any[]> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');

    const bookmarkIds = (user.bookmarks || []) as string[];
    if (bookmarkIds.length === 0) return [];

    const ideas = await Promise.all(
      bookmarkIds.map(id => this.ideaRepo.findById(id))
    );
    return ideas.filter(idea => idea !== null);
  }
}
export default UserService;

