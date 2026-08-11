import { Progress as PrismaProgress } from '@prisma/client';

export interface IRoadmapProgress {
  roadmapId: any;
  completedSteps: any;
  percentageComplete: number;
  readinessScore: number;
  isCompleted: boolean;
}

export interface ILearningProgress {
  resourceId: any;
  isCompleted: boolean;
  completedAt: Date | null;
}

export interface IProgress extends Omit<PrismaProgress, 'roadmapProgress' | 'learningProgress' | 'certificates'> {
  roadmapProgress: IRoadmapProgress[];
  learningProgress: ILearningProgress[];
  certificates: any[];
}
