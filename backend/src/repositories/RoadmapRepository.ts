import { IRoadmap, IRoadmapStep } from '../models/Roadmap';
import { getPrismaClient } from '../config/prisma';

export class RoadmapRepository {
  private get prisma() {
    return getPrismaClient();
  }

  private mapRoadmap(roadmap: any) {
    if (!roadmap) return null;
    return {
      ...roadmap,
      _id: roadmap.id,
      // Reconstruct costEstimation for API compatibility
      costEstimation: {
        marketing: roadmap.costMarketing,
        registration: roadmap.costRegistration,
        equipment: roadmap.costEquipment,
        scaling: roadmap.costScaling
      },
      steps: roadmap.steps ? roadmap.steps.map((s: any) => ({
        ...s,
        _id: s.id
      })) : []
    };
  }

  private mapStep(step: any) {
    if (!step) return null;
    return {
      ...step,
      _id: step.id
    };
  }

  async createRoadmap(roadmapData: Partial<IRoadmap>): Promise<IRoadmap> {
    const data = roadmapData as any;
    const costEstimation = data.costEstimation || { marketing: 0, registration: 0, equipment: 0, scaling: 0 };
    const roadmap = await this.prisma.roadmap.create({
      data: {
        businessIdeaId: data.businessIdeaId,
        overview: data.overview,
        duration: data.duration,
        costMarketing: costEstimation.marketing || 0,
        costRegistration: costEstimation.registration || 0,
        costEquipment: costEstimation.equipment || 0,
        costScaling: costEstimation.scaling || 0,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false
      }
    });
    return this.mapRoadmap(roadmap) as any;
  }

  async createRoadmapStep(stepData: Partial<IRoadmapStep>): Promise<IRoadmapStep> {
    const data = stepData as any;
    const step = await this.prisma.roadmapStep.create({
      data: {
        roadmapId: data.roadmapId,
        stepNumber: data.stepNumber,
        title: data.title,
        description: data.description,
        estimatedTime: data.estimatedTime,
        videoUrl: data.videoUrl,
        articleUrl: data.articleUrl,
        checklist: data.checklist || [],
        resources: data.resources || []
      }
    });
    return this.mapStep(step) as any;
  }

  async findById(id: string): Promise<IRoadmap | null> {
    const roadmap = await this.prisma.roadmap.findFirst({
      where: { id, isDeleted: false },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });
    return this.mapRoadmap(roadmap) as any;
  }

  async findByBusinessIdeaId(businessIdeaId: string): Promise<IRoadmap | null> {
    const roadmap = await this.prisma.roadmap.findFirst({
      where: { businessIdeaId, isDeleted: false },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' }
        }
      }
    });
    return this.mapRoadmap(roadmap) as any;
  }

  async findStepById(stepId: string): Promise<IRoadmapStep | null> {
    const step = await this.prisma.roadmapStep.findUnique({
      where: { id: stepId }
    });
    return this.mapStep(step) as any;
  }

  async updateRoadmap(id: string, updateData: Partial<IRoadmap>): Promise<IRoadmap | null> {
    const data = { ...updateData } as any;
    // Handle costEstimation if provided
    if (data.costEstimation) {
      data.costMarketing = data.costEstimation.marketing;
      data.costRegistration = data.costEstimation.registration;
      data.costEquipment = data.costEstimation.equipment;
      data.costScaling = data.costEstimation.scaling;
      delete data.costEstimation;
    }
    const roadmap = await this.prisma.roadmap.update({
      where: { id },
      data
    });
    return this.mapRoadmap(roadmap) as any;
  }

  async softDeleteRoadmap(id: string): Promise<IRoadmap | null> {
    const roadmap = await this.prisma.roadmap.update({
      where: { id },
      data: { isDeleted: true }
    });
    return this.mapRoadmap(roadmap) as any;
  }
}

export default RoadmapRepository;
