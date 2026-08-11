import { Response, NextFunction } from 'express';
import ProgressService from '../services/ProgressService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ProgressController {
  private progressService = new ProgressService();

  completeStep = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { roadmapId, stepId, isCompleted } = req.body;
      const progress = await this.progressService.completeRoadmapStep(userId, roadmapId, stepId, isCompleted);

      res.status(200).json({
        success: true,
        message: 'Step completion updated successfully.',
        data: progress
      });
    } catch (error) {
      next(error);
    }
  };

  completeResource = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { resourceId, hoursSpent } = req.body;
      const progress = await this.progressService.completeLearningResource(userId, resourceId, hoursSpent);

      res.status(200).json({
        success: true,
        message: 'Learning progress updated successfully.',
        data: progress
      });
    } catch (error) {
      next(error);
    }
  };

  getProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const progress = await this.progressService.getProgressByUserId(userId);

      res.status(200).json({
        success: true,
        message: 'Progress metrics retrieved successfully.',
        data: progress
      });
    } catch (error) {
      next(error);
    }
  };
}
export default ProgressController;
