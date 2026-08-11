import { BusinessIdea as PrismaBusinessIdea } from '@prisma/client';

export interface IBusinessIdea extends PrismaBusinessIdea {
  // Virtual field reconstructed by the repository mapper
  investmentRange: { min: number; max: number };
  // Virtual fields from junction table
  mentorRecommendations?: any[];
  mentorRecommendationIds?: string[];
}
