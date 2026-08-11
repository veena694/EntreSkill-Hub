import { Router } from 'express';
import BusinessIdeaController from '../controllers/BusinessIdeaController';
import authenticate from '../middleware/auth.middleware';

const router = Router();
const controller = new BusinessIdeaController();

router.get('/', controller.searchIdeas);
router.get('/:slug', controller.getIdeaDetail);
router.post('/recommendations', authenticate, controller.getRecommendations);

export default router;
