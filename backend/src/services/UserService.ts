import UserRepository from '../repositories/UserRepository';
import ProgressRepository from '../repositories/ProgressRepository';
import BookingRepository from '../repositories/BookingRepository';
import { IUser } from '../models/User';

export class UserService {
  private userRepo = new UserRepository();
  private progressRepo = new ProgressRepository();
  private bookingRepo = new BookingRepository();

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
}
export default UserService;
