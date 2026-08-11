import { z } from 'zod';

export const createBookingSchema = z.object({
  mentorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Mentor ID format'),
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid booking date string'
  }),
  timeSlot: z.string().min(1, 'Time slot is required'),
  notes: z.string().optional()
});

export const requestRescheduleSchema = z.object({
  newDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid reschedule date string'
  }),
  newTimeSlot: z.string().min(1, 'New time slot is required'),
  reason: z.string().optional()
});
