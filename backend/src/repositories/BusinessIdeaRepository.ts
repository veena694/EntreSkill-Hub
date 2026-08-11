import { IBusinessIdea } from '../models/BusinessIdea';
import { BusinessIdeaStatus } from '../constants';
import { getPrismaClient } from '../config/prisma';

export class BusinessIdeaRepository {
  private get prisma() {
    return getPrismaClient();
  }

  private mapIdea(idea: any) {
    if (!idea) return null;
    return {
      ...idea,
      _id: idea.id,
      // Reconstruct investmentRange for API compatibility
      investmentRange: { min: idea.investmentMin, max: idea.investmentMax },
      mentorRecommendations: idea.mentorRecommendations ? idea.mentorRecommendations.map((mbi: any) => {
        const m = mbi.mentor || mbi;
        return {
          ...m,
          _id: m.id,
          userId: m.user ? {
            ...m.user,
            _id: m.userId,
            id: m.userId
          } : m.userId
        };
      }) : [],
      mentorRecommendationIds: idea.mentorRecommendations
        ? idea.mentorRecommendations.map((mbi: any) => mbi.mentorId || mbi.id)
        : []
    };
  }

  async create(ideaData: Partial<IBusinessIdea>): Promise<IBusinessIdea> {
    const data = ideaData as any;
    const investmentRange = data.investmentRange || { min: 0, max: 0 };
    const mentorIds: string[] = data.mentorRecommendationIds || data.mentorRecommendations || [];

    const idea = await this.prisma.businessIdea.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category,
        subcategory: data.subcategory,
        investmentMin: investmentRange.min || 0,
        investmentMax: investmentRange.max || 0,
        expectedRevenue: data.expectedRevenue || '',
        difficultyLevel: data.difficultyLevel,
        riskLevel: data.riskLevel,
        requiredSkills: data.requiredSkills || [],
        requiredEquipment: data.requiredEquipment || [],
        marketDemand: data.marketDemand || '',
        successTips: data.successTips || [],
        commonChallenges: data.commonChallenges || [],
        images: data.images || [],
        videos: data.videos || [],
        learningResources: data.learningResources || [],
        tags: data.tags || [],
        status: data.status || 'pending',
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        bookmarkCount: data.bookmarkCount !== undefined ? data.bookmarkCount : 0,
        popularityScore: data.popularityScore !== undefined ? data.popularityScore : 0,
        mentorRecommendations: mentorIds.length > 0 ? {
          create: mentorIds.map((mentorId: string) => ({ mentorId }))
        } : undefined
      },
      include: {
        mentorRecommendations: {
          include: { mentor: { include: { user: true } } }
        }
      }
    });
    return this.mapIdea(idea) as any;
  }

  async findById(id: string): Promise<IBusinessIdea | null> {
    const idea = await this.prisma.businessIdea.findFirst({
      where: { id, isDeleted: false },
      include: {
        mentorRecommendations: {
          include: {
            mentor: {
              include: { user: true }
            }
          }
        }
      }
    });
    return this.mapIdea(idea) as any;
  }

  async findBySlug(slug: string): Promise<IBusinessIdea | null> {
    const idea = await this.prisma.businessIdea.findFirst({
      where: { slug, isDeleted: false },
      include: {
        mentorRecommendations: {
          include: {
            mentor: {
              include: { user: true }
            }
          }
        }
      }
    });
    return this.mapIdea(idea) as any;
  }

  async searchAndFilter(params: {
    query?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    difficulty?: string;
    tags?: string[];
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    page: number;
    limit: number;
  }): Promise<{ ideas: IBusinessIdea[]; total: number }> {
    const { query, category, minBudget, maxBudget, difficulty, tags, sortField = 'createdAt', sortOrder = 'desc', page, limit } = params;
    
    const where: any = { isDeleted: false, status: BusinessIdeaStatus.APPROVED };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query } }
      ];
    }
    if (category) {
      where.category = category;
    }
    // Investment range filtering — now flat columns instead of embedded object
    if (minBudget !== undefined) {
      where.investmentMin = { gte: minBudget };
    }
    if (maxBudget !== undefined) {
      where.investmentMax = { lte: maxBudget };
    }
    if (difficulty) {
      where.difficultyLevel = difficulty;
    }
    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const orderBy: any = {};
    if (sortField) {
      orderBy[sortField] = sortOrder;
    }

    const skip = (page - 1) * limit;
    const ideas = await this.prisma.businessIdea.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        mentorRecommendations: {
          include: {
            mentor: {
              include: { user: true }
            }
          }
        }
      }
    });
      
    const total = await this.prisma.businessIdea.count({ where });
    
    return { 
      ideas: ideas.map(i => this.mapIdea(i)) as any, 
      total 
    };
  }

  async findForRecommendation(): Promise<IBusinessIdea[]> {
    const ideas = await this.prisma.businessIdea.findMany({
      where: { isDeleted: false, status: BusinessIdeaStatus.APPROVED }
    });
    return ideas.map(i => this.mapIdea(i)) as any;
  }

  async update(id: string, updateData: Partial<IBusinessIdea>): Promise<IBusinessIdea | null> {
    const data = { ...updateData } as any;
    // Handle investmentRange if provided
    if (data.investmentRange) {
      data.investmentMin = data.investmentRange.min;
      data.investmentMax = data.investmentRange.max;
      delete data.investmentRange;
    }
    // Handle mentorRecommendations via junction table
    if (data.mentorRecommendations || data.mentorRecommendationIds) {
      const mentorIds = data.mentorRecommendationIds || data.mentorRecommendations;
      delete data.mentorRecommendations;
      delete data.mentorRecommendationIds;
      // Delete existing and recreate
      await this.prisma.mentorBusinessIdea.deleteMany({ where: { businessIdeaId: id } });
      if (mentorIds && mentorIds.length > 0) {
        await this.prisma.mentorBusinessIdea.createMany({
          data: mentorIds.map((mentorId: string) => ({ mentorId, businessIdeaId: id }))
        });
      }
    }
    const idea = await this.prisma.businessIdea.update({
      where: { id },
      data
    });
    return this.mapIdea(idea) as any;
  }

  async incrementBookmarkCount(id: string, incrementValue: number): Promise<IBusinessIdea | null> {
    const idea = await this.prisma.businessIdea.update({
      where: { id },
      data: {
        bookmarkCount: { increment: incrementValue },
        popularityScore: { increment: incrementValue * 10 }
      }
    });
    return this.mapIdea(idea) as any;
  }

  async softDelete(id: string): Promise<IBusinessIdea | null> {
    const idea = await this.prisma.businessIdea.update({
      where: { id },
      data: { isDeleted: true }
    });
    return this.mapIdea(idea) as any;
  }
}

export default BusinessIdeaRepository;
