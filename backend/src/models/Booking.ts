import { MentorBooking as PrismaMentorBooking } from '@prisma/client';

export interface IMentorBooking extends Omit<PrismaMentorBooking, 'userId' | 'mentorId' | 'feedback' | 'rescheduleRequests'> {
  userId: any;
  mentorId: any;
  feedback: any;           // JSON {rating, comment}
  rescheduleRequests: any; // JSON {requestedBy, newDate, newTimeSlot, reason}
}
