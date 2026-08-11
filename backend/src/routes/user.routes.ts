import { Router } from 'express';
import UserController from '../controllers/UserController';
import validateRequest from '../middleware/validation.middleware';
import authenticate from '../middleware/auth.middleware';
import { updateProfileSchema } from '../validators/user.validator';

const router = Router();
const controller = new UserController();

router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), controller.updateProfile);
router.get('/dashboard', authenticate, controller.getDashboard);
router.get('/export', authenticate, controller.exportProfile);

export default router;
