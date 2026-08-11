import ProgressRepository from '../repositories/ProgressRepository';
import RoadmapRepository from '../repositories/RoadmapRepository';
import { IProgress } from '../models/Progress';

export class ProgressService {
  private progressRepo = new ProgressRepository();
  private roadmapRepo = new RoadmapRepository();

  async completeRoadmapStep(userId: string, roadmapId: string, stepId: string, isCompleted: boolean): Promise<IProgress | null> {
    const roadmap = await this.roadmapRepo.findById(roadmapId);
    if (!roadmap) {
      throw new Error('Roadmap not found');
    }

    const totalStepsCount = roadmap.steps.length;
    if (totalStepsCount === 0) {
      throw new Error('Roadmap has no steps');
    }

    // Toggle step completion in DB
    const updatedProgress = await this.progressRepo.updateRoadmapProgress(userId, roadmapId, stepId, isCompleted, totalStepsCount);
    
    // Check if entire roadmap completed to award achievement & certificate
    if (updatedProgress) {
      const roadmapTracker = updatedProgress.roadmapProgress.find(rp => rp.roadmapId._id.toString() === roadmapId);
      if (roadmapTracker && roadmapTracker.isCompleted) {
        // Issue completion certificate if not already issued
        const certTitle = `Roadmap Completion: ${roadmap.businessIdeaId}`;
        const hasCert = updatedProgress.certificates.some(c => c.title === certTitle);
        if (!hasCert) {
          const certificateId = `CERT-SEED-${Math.floor(100000 + Math.random() * 900000)}`;
          return this.progressRepo.addCertificate(userId, certTitle, certificateId);
        }
      }
    }

    return updatedProgress;
  }

  async getProgressByUserId(userId: string): Promise<IProgress | null> {
    const progress = await this.progressRepo.findByUserId(userId);
    if (!progress) {
      return this.progressRepo.initialize(userId);
    }
    return progress;
  }

  async completeLearningResource(userId: string, resourceId: string, hours?: number): Promise<IProgress | null> {
    return this.progressRepo.updateLearningProgress(userId, resourceId, true, hours);
  }
}
export default ProgressService;
