import BookingRepository from '../repositories/BookingRepository';
import MentorRepository from '../repositories/MentorRepository';
import { IMentorBooking } from '../models/Booking';
import { BookingStatus } from '../constants';

export class BookingService {
  private bookingRepo = new BookingRepository();
  private mentorRepo = new MentorRepository();

  async createBooking(userId: string, mentorId: string, dateStr: string, timeSlot: string, notes?: string): Promise<IMentorBooking> {
    const bookingDate = new Date(dateStr);
    
    // Check if mentor exists
    const mentor = await this.mentorRepo.findById(mentorId);
    if (!mentor) {
      throw new Error('Mentor not found');
    }

    // Verify slot is in mentor's availability
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hasDay = (mentor.availability as any[]).find((av: any) => av.dayOfWeek === dayOfWeek);
    const hasSlot = hasDay && hasDay.slots.some((s: any) => s.toLowerCase() === timeSlot.toLowerCase());
    
    if (!hasSlot) {
      throw new Error('Time slot is not available for this mentor');
    }

    // Prevent double booking
    const isOverlapping = await this.bookingRepo.checkSlotOverlap(mentorId, bookingDate, timeSlot);
    if (isOverlapping) {
      throw new Error('Time slot already booked');
    }

    const meetingLink = `https://meet.jit.si/entreskillhub-session-${Math.random().toString(36).substring(2, 10)}`;

    return this.bookingRepo.create({
      userId: userId as any,
      mentorId: mentorId as any,
      bookingDate,
      timeSlot,
      notes,
      meetingLink,
      status: BookingStatus.PENDING
    });
  }

  async acceptBooking(bookingId: string, mentorId: string): Promise<IMentorBooking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.mentorId._id.toString() !== mentorId) {
      throw new Error('Unauthorized');
    }

    return this.bookingRepo.update(bookingId, { status: BookingStatus.ACCEPTED }) as Promise<IMentorBooking>;
  }

  async rejectBooking(bookingId: string, mentorId: string): Promise<IMentorBooking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.mentorId._id.toString() !== mentorId) {
      throw new Error('Unauthorized');
    }

    return this.bookingRepo.update(bookingId, { status: BookingStatus.REJECTED }) as Promise<IMentorBooking>;
  }

  async requestReschedule(bookingId: string, actor: 'user' | 'mentor', actorId: string, dateStr: string, timeSlot: string, reason?: string): Promise<IMentorBooking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Authorization check
    if (actor === 'user' && booking.userId._id.toString() !== actorId) {
      throw new Error('Unauthorized');
    }
    if (actor === 'mentor' && booking.mentorId._id.toString() !== actorId) {
      throw new Error('Unauthorized');
    }

    const newDate = new Date(dateStr);
    const isOverlapping = await this.bookingRepo.checkSlotOverlap(booking.mentorId._id.toString(), newDate, timeSlot);
    if (isOverlapping) {
      throw new Error('Target reschedule slot is already booked');
    }

    return this.bookingRepo.update(bookingId, {
      status: BookingStatus.RESCHEDULED,
      rescheduleRequests: {
        requestedBy: actor,
        newDate,
        newTimeSlot: timeSlot,
        reason: reason || null
      }
    }) as Promise<IMentorBooking>;
  }

  async confirmReschedule(bookingId: string, actor: 'user' | 'mentor', actorId: string): Promise<IMentorBooking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking || !booking.rescheduleRequests) {
      throw new Error('No active reschedule request found');
    }

    // Confirming party must be the opposite of the requester
    const requester = booking.rescheduleRequests.requestedBy;
    if (requester === actor) {
      throw new Error('Cannot approve your own reschedule request');
    }

    if (actor === 'user' && booking.userId._id.toString() !== actorId) {
      throw new Error('Unauthorized');
    }
    if (actor === 'mentor' && booking.mentorId._id.toString() !== actorId) {
      throw new Error('Unauthorized');
    }

    const { newDate, newTimeSlot } = booking.rescheduleRequests;

    return this.bookingRepo.update(bookingId, {
      bookingDate: newDate,
      timeSlot: newTimeSlot,
      status: BookingStatus.ACCEPTED,
      rescheduleRequests: undefined
    }) as Promise<IMentorBooking>;
  }

  async getBookingsForUser(userId: string): Promise<IMentorBooking[]> {
    return this.bookingRepo.findByUser(userId);
  }

  async getBookingsForMentor(mentorId: string): Promise<IMentorBooking[]> {
    return this.bookingRepo.findByMentor(mentorId);
  }
}
export default BookingService;
