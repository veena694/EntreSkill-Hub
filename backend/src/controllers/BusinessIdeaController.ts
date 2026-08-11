import { Request, Response, NextFunction } from 'express';
import BusinessIdeaRepository from '../repositories/BusinessIdeaRepository';
import RecommendationService from '../services/RecommendationService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class BusinessIdeaController {
  private ideaRepo = new BusinessIdeaRepository();
  private recommendationService = new RecommendationService();

  getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { skills, interests, budget, experience } = req.body;
      const recommendations = await this.recommendationService.getRecommendations({
        skills: skills || [],
        interests: interests || [],
        budget: budget || 0,
        experience: experience || 'beginner'
      });

      res.status(200).json({
        success: true,
        message: 'Business ideas recommendation generated successfully.',
        data: recommendations
      });
    } catch (error) {
      next(error);
    }
  };

  searchIdeas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const query = req.query.q as string;
      const category = req.query.category as string;
      const difficulty = req.query.difficulty as string;
      const minBudget = req.query.minBudget ? parseFloat(req.query.minBudget as string) : undefined;
      const maxBudget = req.query.maxBudget ? parseFloat(req.query.maxBudget as string) : undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const sortField = req.query.sortField as string;
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      const { ideas, total } = await this.ideaRepo.searchAndFilter({
        query,
        category,
        minBudget,
        maxBudget,
        difficulty,
        tags,
        sortField,
        sortOrder,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        message: 'Business ideas search completed successfully.',
        data: ideas,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getIdeaDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idea = await this.ideaRepo.findBySlug(req.params.slug);
      if (!idea) {
        res.status(404).json({ success: false, message: 'Business idea not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Business idea retrieved successfully.',
        data: idea
      });
    } catch (error) {
      next(error);
    }
  };
}
export default BusinessIdeaController;
