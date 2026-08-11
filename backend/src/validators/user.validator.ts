import { z } from 'zod';

export const updateProfileSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(1).optional(),
    phoneNumber: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().optional(),
    profilePicture: z.string().optional()
  }).optional(),
  onboarding: z.object({
    skills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    budget: z.number().nonnegative().optional(),
    experience: z.string().optional(),
    goals: z.array(z.string()).optional()
  }).optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    darkMode: z.boolean().optional(),
    publicProfile: z.boolean().optional()
  }).optional()
});
