import BookingService from '../services/BookingService';
import { getPrismaClient } from '../config/prisma';

let prisma = getPrismaClient();

beforeAll(async () => {
  prisma = getPrismaClient();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

let studentId: string;
let mentorProfileId: string;

beforeEach(async () => {
  await prisma.mentorBooking.deleteMany({});
  await prisma.mentor.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed student user
  const student = await prisma.user.create({
    data: {
      email: 'student@test.com',
      passwordHash: 'dummy',
      personalInfo: { fullName: 'Test Student', phoneNumber: null, location: null, profilePicture: null, bio: null },
      onboarding: { skills: [], interests: [], budget: 0, experience: '', goals: [] },
      preferences: { notifications: true, darkMode: false, publicProfile: true }
    }
  });
  studentId = student.id;

  // Seed mentor user
  const mentorUser = await prisma.user.create({
    data: {
      email: 'mentor@test.com',
      passwordHash: 'dummy',
      personalInfo: { fullName: 'Elena Mentor', phoneNumber: null, location: null, profilePicture: null, bio: null },
      onboarding: { skills: [], interests: [], budget: 0, experience: '', goals: [] },
      preferences: { notifications: true, darkMode: false, publicProfile: true }
    }
  });

  const mentorProfile = await prisma.mentor.create({
    data: {
      userId: mentorUser.id,
      specialization: 'Fintech',
      isVerified: true,
      availability: [
        {
          dayOfWeek: 'monday',
          slots: ['09:00 AM - 10:00 AM']
        }
      ],
      socialLinks: { linkedin: '', website: '' }
    }
  });
  mentorProfileId = mentorProfile.id;
});

describe('Booking Service scheduling constraints', () => {
  const service = new BookingService();

  it('should successfully book slot if slot is available', async () => {
    const booking = await service.createBooking(
      studentId,
      mentorProfileId,
      '2026-07-06',
      '09:00 AM - 10:00 AM',
      'Initial chat'
    );

    expect(booking).toBeDefined();
    expect(booking.timeSlot).toBe('09:00 AM - 10:00 AM');
    expect(booking.notes).toBe('Initial chat');
  });

  it('should block double booking on same slot coordinate', async () => {
    await service.createBooking(
      studentId,
      mentorProfileId,
      '2026-07-06',
      '09:00 AM - 10:00 AM',
      'First meeting'
    );

    await expect(
      service.createBooking(
        studentId,
        mentorProfileId,
        '2026-07-06',
        '09:00 AM - 10:00 AM',
        'Second meeting'
      )
    ).rejects.toThrow('Time slot already booked');
  });
});
