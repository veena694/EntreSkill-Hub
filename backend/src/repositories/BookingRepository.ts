import { IMentorBooking } from '../models/Booking';
import { BookingStatus } from '../constants';
import { getPrismaClient } from '../config/prisma';

export class BookingRepository {
  private get prisma() {
    return getPrismaClient();
  }

  private mapBooking(booking: any) {
    if (!booking) return null;
    return {
      ...booking,
      _id: booking.id,
      userId: booking.user ? {
        ...booking.user,
        _id: booking.userId,
        id: booking.userId
      } : booking.userId,
      mentorId: booking.mentor ? {
        ...booking.mentor,
        _id: booking.mentorId,
        id: booking.mentorId,
        userId: booking.mentor.user ? {
          ...booking.mentor.user,
          _id: booking.mentor.userId,
          id: booking.mentor.userId
        } : booking.mentor.userId
      } : booking.mentorId
    };
  }

  async create(bookingData: Partial<IMentorBooking>): Promise<IMentorBooking> {
    const data = bookingData as any;
    const booking = await this.prisma.mentorBooking.create({
      data: {
        userId: data.userId,
        mentorId: data.mentorId,
        bookingDate: new Date(data.bookingDate),
        timeSlot: data.timeSlot,
        status: data.status || 'pending',
        notes: data.notes,
        meetingLink: data.meetingLink,
        feedback: data.feedback,
        rescheduleRequests: data.rescheduleRequests,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false
      }
    });
    return this.mapBooking(booking) as any;
  }

  async findById(id: string): Promise<IMentorBooking | null> {
    const booking = await this.prisma.mentorBooking.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: true,
        mentor: {
          include: {
            user: true
          }
        }
      }
    });
    return this.mapBooking(booking) as any;
  }

  async checkSlotOverlap(mentorId: string, date: Date, timeSlot: string): Promise<boolean> {
    const overlap = await this.prisma.mentorBooking.findFirst({
      where: {
        mentorId,
        bookingDate: date,
        timeSlot,
        status: { in: [BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.RESCHEDULED] },
        isDeleted: false
      }
    });
    return overlap !== null;
  }

  async findByUser(userId: string): Promise<IMentorBooking[]> {
    const bookings = await this.prisma.mentorBooking.findMany({
      where: { userId, isDeleted: false },
      include: {
        mentor: {
          include: {
            user: true
          }
        }
      },
      orderBy: { bookingDate: 'desc' }
    });
    return bookings.map(b => this.mapBooking(b)) as any;
  }

  async findByMentor(mentorId: string): Promise<IMentorBooking[]> {
    const bookings = await this.prisma.mentorBooking.findMany({
      where: { mentorId, isDeleted: false },
      include: {
        user: true
      },
      orderBy: { bookingDate: 'desc' }
    });
    return bookings.map(b => this.mapBooking(b)) as any;
  }

  async update(id: string, updateData: Partial<IMentorBooking>): Promise<IMentorBooking | null> {
    const data = { ...updateData } as any;
    
    if (data.bookingDate) {
      data.bookingDate = new Date(data.bookingDate);
    }
    if (data.rescheduleRequests && data.rescheduleRequests.newDate) {
      data.rescheduleRequests.newDate = new Date(data.rescheduleRequests.newDate);
    }

    const booking = await this.prisma.mentorBooking.update({
      where: { id },
      data
    });
    return this.mapBooking(booking) as any;
  }

  async softDelete(id: string): Promise<IMentorBooking | null> {
    const booking = await this.prisma.mentorBooking.update({
      where: { id },
      data: { isDeleted: true }
    });
    return this.mapBooking(booking) as any;
  }
}

export default BookingRepository;
