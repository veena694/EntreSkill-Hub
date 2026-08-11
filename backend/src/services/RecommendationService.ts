import BusinessIdeaRepository from '../repositories/BusinessIdeaRepository';
import { IBusinessIdea } from '../models/BusinessIdea';

export interface UserPreferences {
  skills: string[];
  interests: string[];
  budget: number;
  experience: string; // e.g. 'beginner', 'intermediate', 'advanced'
}

export interface RecommendedIdea {
  idea: IBusinessIdea;
  score: number; // out of 100
  matchDetails: {
    budgetMatch: boolean;
    skillsMatchCount: number;
    interestsMatchCount: number;
    experienceMatch: boolean;
  };
}

export class RecommendationService {
  private ideaRepo = new BusinessIdeaRepository();

  async getRecommendations(prefs: UserPreferences): Promise<RecommendedIdea[]> {
    const ideas = await this.ideaRepo.findForRecommendation();
    const recommendedList: RecommendedIdea[] = [];

    for (const idea of ideas) {
      let score = 0;
      
      // 1. Budget Match (Max weight: 40 points)
      const budgetMatch = prefs.budget >= idea.investmentRange.min;
      let budgetScore = 0;
      if (budgetMatch) {
        budgetScore = 40;
        // Reward if user budget has head-room
        if (prefs.budget >= idea.investmentRange.max) {
          budgetScore += 5; // Bonus
        }
      } else {
        // Partial score if slightly below budget
        const ratio = prefs.budget / idea.investmentRange.min;
        budgetScore = Math.max(0, Math.round(ratio * 25));
      }
      score += Math.min(45, budgetScore);

      // 2. Skills Match (Max weight: 30 points)
      let skillsMatchCount = 0;
      if (idea.requiredSkills && idea.requiredSkills.length > 0) {
        const overlap = idea.requiredSkills.filter(s => 
          prefs.skills.some(ps => ps.toLowerCase() === s.toLowerCase())
        );
        skillsMatchCount = overlap.length;
        const skillRatio = overlap.length / idea.requiredSkills.length;
        score += Math.round(skillRatio * 30);
      } else {
        score += 20; // Default match points if no skills required
      }

      // 3. Interests Match (Max weight: 20 points)
      let interestsMatchCount = 0;
      const cleanInterests = prefs.interests.map(i => i.toLowerCase());
      const categoryMatch = cleanInterests.includes(idea.category.toLowerCase());
      if (categoryMatch) {
        interestsMatchCount += 1;
        score += 15;
      }
      
      const tagOverlap = idea.tags.filter(t => cleanInterests.includes(t.toLowerCase()));
      interestsMatchCount += tagOverlap.length;
      score += Math.min(10, tagOverlap.length * 5);

      // 4. Experience & Difficulty Match (Max weight: 10 points)
      // Map user experience to DifficultyLevel
      let experienceMatch = false;
      const userExp = prefs.experience.toLowerCase();
      const ideaDiff = idea.difficultyLevel.toLowerCase();
      
      if (userExp === 'expert' || userExp === 'advanced') {
        experienceMatch = true; // Can do anything
      } else if (userExp === 'intermediate' && (ideaDiff === 'intermediate' || ideaDiff === 'beginner')) {
        experienceMatch = true;
      } else if (userExp === 'beginner' && ideaDiff === 'beginner') {
        experienceMatch = true;
      }

      if (experienceMatch) {
        score += 10;
      } else {
        score += 3; // Penalty for over-difficulty
      }

      // Cap final score at 100
      const finalScore = Math.min(100, score);

      recommendedList.push({
        idea,
        score: finalScore,
        matchDetails: {
          budgetMatch,
          skillsMatchCount,
          interestsMatchCount,
          experienceMatch
        }
      });
    }

    // Sort by match score descending
    return recommendedList.sort((a, b) => b.score - a.score);
  }
}
export default RecommendationService;
