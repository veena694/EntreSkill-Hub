import { connectDB, disconnectDB } from '../config/db';
import { getPrismaClient } from '../config/prisma';
import UserRepository from '../repositories/UserRepository';
import MentorRepository from '../repositories/MentorRepository';
import BusinessIdeaRepository from '../repositories/BusinessIdeaRepository';
import RoadmapRepository from '../repositories/RoadmapRepository';
import { UserRole, BusinessIdeaStatus, DifficultyLevel, RiskLevel } from '../constants';

export const seedData = async (shouldConnectDisconnect = true): Promise<void> => {
  try {
    if (shouldConnectDisconnect) {
      await connectDB();
    }

    const prisma = getPrismaClient();

    console.log('Clearing old tables...');
    await prisma.mentorBusinessIdea.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.emailVerificationToken.deleteMany({});
    await prisma.passwordResetToken.deleteMany({});
    await prisma.mentorBooking.deleteMany({});
    await prisma.progress.deleteMany({});
    await prisma.roadmapStep.deleteMany({});
    await prisma.roadmap.deleteMany({});
    await prisma.businessIdea.deleteMany({});
    await prisma.mentor.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.skill.deleteMany({});
    await prisma.interest.deleteMany({});
    await prisma.category.deleteMany({});

    console.log('Seeding taxonomies...');
    await prisma.skill.create({ data: { name: 'Agriculture', slug: 'agriculture' } });
    await prisma.skill.create({ data: { name: 'Programming', slug: 'programming' } });
    await prisma.skill.create({ data: { name: 'Sales', slug: 'sales' } });

    await prisma.interest.create({ data: { name: 'Technology', slug: 'technology' } });
    await prisma.interest.create({ data: { name: 'Food', slug: 'food' } });
    await prisma.interest.create({ data: { name: 'Agriculture', slug: 'agriculture' } });

    await prisma.category.create({ data: { name: 'Agri-Tech', slug: 'agri-tech' } });
    await prisma.category.create({ data: { name: 'SaaS', slug: 'saas' } });

    // ─────────────────────────────────────────────────────────
    // DEVELOPMENT-ONLY FIXTURES
    // These demo accounts must NEVER be used as a fallback
    // authenticated user in production. In production only
    // real users registered through the API exist.
    // ─────────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
      console.log('Seeding development fixtures (non-production only)...');
      const userRepo = new UserRepository();
      const mentorRepo = new MentorRepository();
      const ideaRepo = new BusinessIdeaRepository();
      const roadmapRepo = new RoadmapRepository();

      await userRepo.create({
        email: 'admin@entreskillhub.com',
        passwordHash: 'adminPassword123',
        role: UserRole.ADMIN as any,
        isVerified: true,
        onboardingCompleted: true,
        personalInfo: { fullName: 'Admin User', phoneNumber: null, location: null, profilePicture: null, bio: null }
      } as any);

      const mentorUser = await userRepo.create({
        email: 'elena@entreskillhub.com',
        passwordHash: 'mentorPassword123',
        role: UserRole.MENTOR as any,
        isVerified: true,
        onboardingCompleted: true,
        personalInfo: { fullName: 'Elena Vance', phoneNumber: null, location: null, profilePicture: null, bio: null }
      } as any);

      await userRepo.create({
        email: 'founder@entreskillhub.com',
        passwordHash: 'founderPassword123',
        role: UserRole.USER as any,
        isVerified: true,
        onboardingCompleted: true,
        personalInfo: { fullName: 'Jordan Hayes', phoneNumber: null, location: null, profilePicture: null, bio: null },
        onboarding: {
          skills: ['Sales'],
          interests: ['Food', 'Agriculture'],
          budget: 4000,
          experience: 'beginner',
          goals: ['Launch agricultural startup']
        }
      } as any);

      console.log('Seeding mentor profiles...');
      const mentorProfile = await mentorRepo.create({
        userId: mentorUser.id as any,
        specialization: 'Scale-up & Fintech Strategist',
        skills: ['Fintech', 'Scale-up'],
        languages: ['English', 'Spanish'],
        ratePerHour: 120,
        isVerified: true,
        availability: [
          {
            dayOfWeek: 'monday',
            slots: ['09:00 AM - 10:00 AM', '02:00 PM - 03:00 PM']
          },
          {
            dayOfWeek: 'wednesday',
            slots: ['09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM']
          }
        ]
      });

      console.log('Seeding business ideas & roadmaps...');
      const idea1 = await ideaRepo.create({
        title: 'Hydroponics Greenhouses',
        slug: 'hydroponics-greenhouses',
        description: 'Establish automated indoor farming units to grow premium organic vegetables locally with 90% less water usage.',
        shortDescription: 'Locally grown premium hydroponic vegetables.',
        category: 'Agri-Tech',
        investmentRange: { min: 1500, max: 6000 },
        expectedRevenue: '$3,500/month',
        difficultyLevel: DifficultyLevel.BEGINNER,
        riskLevel: RiskLevel.LOW,
        requiredSkills: ['Agriculture'],
        requiredEquipment: ['Hydroponic racks', 'Grow lights', 'Nutrient solutions'],
        marketDemand: 'High local demand for clean pesticide-free greens.',
        successTips: ['Focus on leafy greens first', 'Partner with local restaurants'],
        commonChallenges: ['PH level shifts', 'Initial setup alignment'],
        tags: ['agriculture', 'food', 'sustainability'],
        status: BusinessIdeaStatus.APPROVED,
        mentorRecommendationIds: [mentorProfile.id]
      } as any);

      const roadmap1 = await roadmapRepo.createRoadmap({
        businessIdeaId: idea1.id,
        overview: 'Multi-stage guide to setup and execute local organic greenhouses.',
        duration: '6 weeks',
        costEstimation: { marketing: 300, registration: 200, equipment: 1500, scaling: 2000 }
      } as any);

      await roadmapRepo.createRoadmapStep({
        roadmapId: roadmap1.id as any,
        stepNumber: 1,
        title: 'Equipment Sourcing & Site Planning',
        description: 'Determine container configurations and source nutrient arrays.',
        estimatedTime: '1 week',
        checklist: [{ item: 'Source hydroponic racks', isOptional: false }, { item: 'Prepare container outline', isOptional: false }]
      });

      await roadmapRepo.createRoadmapStep({
        roadmapId: roadmap1.id as any,
        stepNumber: 2,
        title: 'Seed Cultivation & Sales Verification',
        description: 'Plant initial spinach batch and draft restaurant sales contracts.',
        estimatedTime: '2 weeks',
        checklist: [{ item: 'Germinate seeds', isOptional: false }, { item: 'Contact 3 local grocers', isOptional: false }]
      });
    } else {
      console.log('Production mode: Skipping demo fixture seeding.');
    }

    console.log('Seeding completed successfully!');
    if (shouldConnectDisconnect) {
      await disconnectDB();
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}
