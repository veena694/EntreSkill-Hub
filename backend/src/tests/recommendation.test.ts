import RecommendationService from '../services/RecommendationService';
import { DifficultyLevel, RiskLevel, BusinessIdeaStatus } from '../constants';
import { getPrismaClient } from '../config/prisma';

let prisma = getPrismaClient();

beforeAll(async () => {
  prisma = getPrismaClient();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.businessIdea.deleteMany({});
  
  await prisma.businessIdea.create({
    data: {
      title: 'Hydroponics Farming',
      slug: 'hydroponics-farming',
      description: 'Automated indoor farming units to grow premium organic vegetables locally with 90% less water usage.',
      shortDescription: 'Organic setups.',
      category: 'Agri-Tech',
      investmentMin: 2000,
      investmentMax: 6000,
      expectedRevenue: '$3,000/month',
      difficultyLevel: DifficultyLevel.BEGINNER,
      riskLevel: RiskLevel.LOW,
      requiredSkills: ['Agriculture'],
      requiredEquipment: ['Trays'],
      marketDemand: 'High',
      successTips: ['Start fast'],
      commonChallenges: ['pH'],
      tags: ['agriculture', 'greens'],
      status: BusinessIdeaStatus.APPROVED
    }
  });

  await prisma.businessIdea.create({
    data: {
      title: 'Cloud Billing Engine',
      slug: 'cloud-billing-engine',
      description: 'SaaS platform metering api.',
      shortDescription: 'Metering API.',
      category: 'SaaS',
      investmentMin: 5000,
      investmentMax: 15000,
      expectedRevenue: '$10,000/month',
      difficultyLevel: DifficultyLevel.ADVANCED,
      riskLevel: RiskLevel.MODERATE,
      requiredSkills: ['Programming'],
      requiredEquipment: ['Computers'],
      marketDemand: 'High',
      successTips: ['API first'],
      commonChallenges: ['scaling'],
      tags: ['technology', 'api'],
      status: BusinessIdeaStatus.APPROVED
    }
  });
});

describe('Recommendation Service matching logic', () => {
  const service = new RecommendationService();

  it('should rank Agri-Tech idea higher for agriculture skills & low budget', async () => {
    const recommendations = await service.getRecommendations({
      skills: ['Agriculture'],
      interests: ['Agriculture', 'Food'],
      budget: 3000,
      experience: 'beginner'
    });

    expect(recommendations.length).toBe(2);
    expect(recommendations[0].idea.title).toBe('Hydroponics Farming');
    expect(recommendations[0].score).toBeGreaterThan(50);
  });

  it('should rank Cloud Billing Engine higher for programming skills & high budget', async () => {
    const recommendations = await service.getRecommendations({
      skills: ['Programming'],
      interests: ['Technology'],
      budget: 8000,
      experience: 'advanced'
    });

    expect(recommendations.length).toBe(2);
    expect(recommendations[0].idea.title).toBe('Cloud Billing Engine');
  });
});
