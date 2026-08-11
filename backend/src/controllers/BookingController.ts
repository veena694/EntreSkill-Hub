import { Response, NextFunction } from 'express';
import BookingService from '../services/BookingService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserRole } from '../constants';
import MentorRepository from '../repositories/MentorRepository';

export class BookingController {
  private bookingService = new BookingService();
  private mentorRepo = new MentorRepository();

  createBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { mentorId, bookingDate, timeSlot, notes } = req.body;
      const booking = await this.bookingService.createBooking(userId, mentorId, bookingDate, timeSlot, notes);

      res.status(201).json({
        success: true,
        message: 'Mentor session booked successfully.',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  acceptBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const mentor = await this.mentorRepo.findByUserId(userId);
      if (!mentor) {
        res.status(403).json({ success: false, message: 'Only active mentors can accept sessions.' });
        return;
      }

      const booking = await this.bookingService.acceptBooking(req.params.id, mentor.id);

      res.status(200).json({
        success: true,
        message: 'Session booking accepted.',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  rejectBooking = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const mentor = await this.mentorRepo.findByUserId(userId);
      if (!mentor) {
        res.status(403).json({ success: false, message: 'Only active mentors can reject sessions.' });
        return;
      }

      const booking = await this.bookingService.rejectBooking(req.params.id, mentor.id);

      res.status(200).json({
        success: true,
        message: 'Session booking rejected.',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  requestReschedule = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { newDate, newTimeSlot, reason } = req.body;

      let actor: 'user' | 'mentor' = 'user';
      let actorId = userId;

      if (req.user!.role === UserRole.MENTOR) {
        const mentor = await this.mentorRepo.findByUserId(userId);
        if (!mentor) {
          res.status(403).json({ success: false, message: 'Mentor profile not found.' });
          return;
        }
        actor = 'mentor';
        actorId = mentor.id;
      }

      const booking = await this.bookingService.requestReschedule(req.params.id, actor, actorId, newDate, newTimeSlot, reason);

      res.status(200).json({
        success: true,
        message: 'Reschedule request submitted.',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  confirmReschedule = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      let actor: 'user' | 'mentor' = 'user';
      let actorId = userId;

      if (req.user!.role === UserRole.MENTOR) {
        const mentor = await this.mentorRepo.findByUserId(userId);
        if (!mentor) {
          res.status(403).json({ success: false, message: 'Mentor profile not found.' });
          return;
        }
        actor = 'mentor';
        actorId = mentor.id;
      }

      const booking = await this.bookingService.confirmReschedule(req.params.id, actor, actorId);

      res.status(200).json({
        success: true,
        message: 'Reschedule confirmed successfully.',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  };

  getMyBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      let bookings = [];

      if (req.user!.role === UserRole.MENTOR) {
        const mentor = await this.mentorRepo.findByUserId(userId);
        if (!mentor) {
          res.status(404).json({ success: false, message: 'Mentor profile not found.' });
          return;
        }
        bookings = await this.bookingService.getBookingsForMentor(mentor.id);
      } else {
        bookings = await this.bookingService.getBookingsForUser(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Bookings list retrieved successfully',
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  };
}
export default BookingController;
