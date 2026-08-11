import { Router } from 'express';
import ProgressController from '../controllers/ProgressController';
import authenticate from '../middleware/auth.middleware';

const router = Router();
const controller = new ProgressController();

router.use(authenticate);

router.post('/step/complete', controller.completeStep);
router.post('/resource/complete', controller.completeResource);
router.get('/', controller.getProgress);

export default router;
