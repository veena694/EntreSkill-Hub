import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, fullName, role } = req.body;
      const user = await this.authService.register(email, password, fullName, role);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. A verification link has been sent to your email.',
        data: { userId: user.id, email: user.email, role: user.role }
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await this.authService.login(email, password);

      // Set cookie configuration for tokens
      res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: { userId: user.id, email: user.email, role: user.role, personalInfo: user.personalInfo },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (!token) {
        res.status(400).json({ success: false, message: 'Refresh token is required' });
        return;
      }

      const { accessToken, refreshToken } = await this.authService.refreshToken(token);

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { accessToken, refreshToken }
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (token) {
        await this.authService.logout(token);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  logoutAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.authService.logoutAllDevices(userId);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      await this.authService.verifyEmail(token);
      
      res.status(200).json({
        success: true,
        message: 'Email verification successful.'
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been dispatched.'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;
      await this.authService.resetPassword(token, password);

      res.status(200).json({
        success: true,
        message: 'Password reset successful.'
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      next(error);
    }
  };

  deactivate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.authService.deactivateAccount(userId);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully.'
      });
    } catch (error) {
      next(error);
    }
  };
}
export default AuthController;
