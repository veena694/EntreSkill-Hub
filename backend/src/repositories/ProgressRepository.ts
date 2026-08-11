import { IProgress } from '../models/Progress';
import { getPrismaClient } from '../config/prisma';

export class ProgressRepository {
  private get prisma() {
    return getPrismaClient();
  }

  private mapProgress(progress: any) {
    if (!progress) return null;
    return {
      ...progress,
      _id: progress.id,
      roadmapProgress: progress.roadmapProgress ? progress.roadmapProgress.map((rp: any) => ({
        ...rp,
        roadmapId: {
          _id: rp.roadmapId,
          id: rp.roadmapId
        },
        completedSteps: rp.completedSteps ? rp.completedSteps.map((cs: any) => ({
          _id: cs,
          id: cs
        })) : []
      })) : [],
      learningProgress: progress.learningProgress ? progress.learningProgress.map((lp: any) => ({
        ...lp,
        resourceId: {
          _id: lp.resourceId,
          id: lp.resourceId
        }
      })) : []
    };
  }

  async findByUserId(userId: string): Promise<IProgress | null> {
    const progress = await this.prisma.progress.findFirst({
      where: { userId }
    });
    return this.mapProgress(progress) as any;
  }

  async initialize(userId: string): Promise<IProgress> {
    const progress = await this.prisma.progress.create({
      data: {
        userId,
        roadmapProgress: [],
        learningProgress: [],
        totalLearningHours: 0,
        certificates: []
      }
    });
    return this.mapProgress(progress) as any;
  }

  async updateRoadmapProgress(userId: string, roadmapId: string, stepId: string, isCompleted: boolean, totalStepsCount: number): Promise<IProgress | null> {
    let progress = await this.prisma.progress.findFirst({ where: { userId } });
    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          userId,
          roadmapProgress: [],
          learningProgress: [],
          totalLearningHours: 0,
          certificates: []
        }
      });
    }

    const roadmapProgressList = [...((progress.roadmapProgress as any[]) || [])];
    const roadmapIdx = roadmapProgressList.findIndex((rp: any) => rp.roadmapId === roadmapId);
    
    if (roadmapIdx === -1) {
      // Add new roadmap tracker
      roadmapProgressList.push({
        roadmapId,
        completedSteps: isCompleted ? [stepId] : [],
        percentageComplete: isCompleted ? Math.round((1 / totalStepsCount) * 100) : 0,
        readinessScore: isCompleted ? Math.round((1 / totalStepsCount) * 100) : 0,
        isCompleted: isCompleted && totalStepsCount === 1
      });
    } else {
      const tracker = { ...roadmapProgressList[roadmapIdx] };
      const completedSteps = [...(tracker.completedSteps || [])];
      const stepIdx = completedSteps.indexOf(stepId);
      
      if (isCompleted && stepIdx === -1) {
        completedSteps.push(stepId);
      } else if (!isCompleted && stepIdx !== -1) {
        completedSteps.splice(stepIdx, 1);
      }

      tracker.completedSteps = completedSteps;
      tracker.percentageComplete = Math.round((completedSteps.length / totalStepsCount) * 100);
      tracker.readinessScore = tracker.percentageComplete;
      tracker.isCompleted = completedSteps.length === totalStepsCount;

      roadmapProgressList[roadmapIdx] = tracker;
    }

    const updated = await this.prisma.progress.update({
      where: { id: progress.id },
      data: {
        roadmapProgress: roadmapProgressList
      }
    });

    return this.mapProgress(updated) as any;
  }

  async updateLearningProgress(userId: string, resourceId: string, isCompleted: boolean, hoursSpent?: number): Promise<IProgress | null> {
    let progress = await this.prisma.progress.findFirst({ where: { userId } });
    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          userId,
          roadmapProgress: [],
          learningProgress: [],
          totalLearningHours: 0,
          certificates: []
        }
      });
    }

    const learningProgressList = [...((progress.learningProgress as any[]) || [])];
    const learnIdx = learningProgressList.findIndex((lp: any) => lp.resourceId === resourceId);
    
    if (learnIdx === -1) {
      learningProgressList.push({
        resourceId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      });
    } else {
      const tracker = { ...learningProgressList[learnIdx] };
      tracker.isCompleted = isCompleted;
      tracker.completedAt = isCompleted ? new Date() : null;
      learningProgressList[learnIdx] = tracker;
    }

    let totalHours = progress.totalLearningHours;
    if (hoursSpent) {
      totalHours += hoursSpent;
    }

    const updated = await this.prisma.progress.update({
      where: { id: progress.id },
      data: {
        learningProgress: learningProgressList,
        totalLearningHours: totalHours
      }
    });

    return this.mapProgress(updated) as any;
  }

  async addCertificate(userId: string, title: string, certificateId: string): Promise<IProgress | null> {
    let progress = await this.prisma.progress.findFirst({ where: { userId } });
    if (!progress) {
      progress = await this.prisma.progress.create({
        data: {
          userId,
          roadmapProgress: [],
          learningProgress: [],
          totalLearningHours: 0,
          certificates: []
        }
      });
    }

    const certs = [...((progress.certificates as any[]) || [])];
    certs.push({ title, certificateId, issuedAt: new Date() });

    const updated = await this.prisma.progress.update({
      where: { id: progress.id },
      data: {
        certificates: certs
      }
    });

    return this.mapProgress(updated) as any;
  }
}

export default ProgressRepository;
