import { Response, NextFunction } from 'express';
import UserService from '../services/UserService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class UserController {
  private userService = new UserService();

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.userService.getProfile(userId);

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.userService.updateProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const metrics = await this.userService.getDashboardData(userId);

      res.status(200).json({
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: metrics
      });
    } catch (error) {
      next(error);
    }
  };

  exportProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const dataStr = await this.userService.exportUserData(userId);

      res.setHeader('Content-disposition', 'attachment; filename=profile-export.json');
      res.setHeader('Content-type', 'application/json');
      res.status(200).send(dataStr);
    } catch (error) {
      next(error);
    }
  };

  completeOnboarding = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { skills, interests, budget, experience, goals } = req.body;

      const user = await this.userService.completeOnboarding(userId, {
        skills: skills || [],
        interests: interests || [],
        budget: budget || 0,
        experience: experience || '',
        goals: goals || []
      });

      res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully.',
        data: {
          onboardingCompleted: user?.onboardingCompleted,
          onboarding: user?.onboarding
        }
      });
    } catch (error) {
      next(error);
    }
  };

  addBookmark = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { ideaId } = req.params;
      const bookmarks = await this.userService.addBookmark(userId, ideaId);

      res.status(200).json({
        success: true,
        message: 'Bookmark added successfully.',
        data: { bookmarks }
      });
    } catch (error) {
      next(error);
    }
  };

  removeBookmark = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { ideaId } = req.params;
      const bookmarks = await this.userService.removeBookmark(userId, ideaId);

      res.status(200).json({
        success: true,
        message: 'Bookmark removed successfully.',
        data: { bookmarks }
      });
    } catch (error) {
      next(error);
    }
  };

  getBookmarks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const bookmarkedIdeas = await this.userService.getUserBookmarks(userId);

      res.status(200).json({
        success: true,
        message: 'Bookmarks retrieved successfully.',
        data: bookmarkedIdeas
      });
    } catch (error) {
      next(error);
    }
  };
}
export default UserController;

