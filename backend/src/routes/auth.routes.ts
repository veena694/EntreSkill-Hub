import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import validateRequest from '../middleware/validation.middleware';
import authenticate from '../middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema
} from '../validators/auth.validator';

const router = Router();
const controller = new AuthController();

router.post('/register', validateRequest(registerSchema), controller.register);
router.post('/login', validateRequest(loginSchema), controller.login);
router.post('/refresh', controller.refreshToken);
router.post('/logout', controller.logout);
router.post('/verify-email', controller.verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), controller.resetPassword);

// Authenticated Routes
router.post('/change-password', authenticate, validateRequest(changePasswordSchema), controller.changePassword);
router.post('/logout-all', authenticate, controller.logoutAll);
router.post('/deactivate', authenticate, controller.deactivate);

export default router;
