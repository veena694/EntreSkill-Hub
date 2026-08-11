import { Router } from 'express';
import BookingController from '../controllers/BookingController';
import validateRequest from '../middleware/validation.middleware';
import authenticate from '../middleware/auth.middleware';
import authorize from '../middleware/rbac.middleware';
import { UserRole } from '../constants';
import { createBookingSchema, requestRescheduleSchema } from '../validators/booking.validator';

const router = Router();
const controller = new BookingController();

router.use(authenticate);

router.post('/', validateRequest(createBookingSchema), controller.createBooking);
router.get('/', controller.getMyBookings);

// Mentor Actions
router.put('/:id/accept', authorize([UserRole.MENTOR, UserRole.ADMIN]), controller.acceptBooking);
router.put('/:id/reject', authorize([UserRole.MENTOR, UserRole.ADMIN]), controller.rejectBooking);

// Rescheduling Flow
router.post('/:id/reschedule', validateRequest(requestRescheduleSchema), controller.requestReschedule);
router.post('/:id/reschedule/confirm', controller.confirmReschedule);

export default router;
