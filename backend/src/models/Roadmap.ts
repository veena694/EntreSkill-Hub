import { 
  RoadmapStep as PrismaRoadmapStep, 
  Roadmap as PrismaRoadmap 
} from '@prisma/client';

export interface IRoadmapStep extends Omit<PrismaRoadmapStep, 'checklist'> {
  checklist: any; // JSON array [{item, isOptional}]
}

export interface IRoadmap extends PrismaRoadmap {
  steps: IRoadmapStep[];
  // Virtual field reconstructed by the repository mapper
  costEstimation?: {
    marketing: number;
    registration: number;
    equipment: number;
    scaling: number;
  };
}
