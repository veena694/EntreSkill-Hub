import { 
  Skill as PrismaSkill, 
  Interest as PrismaInterest, 
  Category as PrismaCategory 
} from '@prisma/client';

export type ISkill = PrismaSkill;
export type IInterest = PrismaInterest;
export type ICategory = PrismaCategory;
