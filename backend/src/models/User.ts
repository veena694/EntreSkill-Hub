import { User as PrismaUser } from '@prisma/client';

export interface PersonalInfo {
  fullName: string;
  phoneNumber?: string | null;
  location?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
}

export interface Onboarding {
  skills: string[];
  interests: string[];
  budget: number;
  experience: string;
  goals: string[];
}

export interface UserPreferences {
  notifications: boolean;
  darkMode: boolean;
  publicProfile: boolean;
}

export interface IUser extends Omit<PrismaUser, 'personalInfo' | 'onboarding' | 'preferences'> {
  personalInfo: PersonalInfo;
  onboarding: Onboarding;
  preferences: UserPreferences;
  onboardingCompleted: boolean;
  bookmarks: string[];
}

export default PrismaUser;
