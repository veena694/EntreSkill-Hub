import { Mentor as PrismaMentor } from '@prisma/client';

export interface IMentor extends Omit<PrismaMentor, 'availability' | 'socialLinks'> {
  availability: any; // JSON array [{dayOfWeek, slots[]}]
  socialLinks: any;  // JSON {linkedin, website}
}
