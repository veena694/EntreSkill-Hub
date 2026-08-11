import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import bookingRouter from './booking.routes';
import progressRouter from './progress.routes';
import businessRouter from './business.routes';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Health status: OK',
    timestamp: new Date()
  });
});

// Route Mounts
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/bookings', bookingRouter);
router.use('/progress', progressRouter);
router.use('/business-ideas', businessRouter);

export default router;
