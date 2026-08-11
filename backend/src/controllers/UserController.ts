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
}
export default UserController;
