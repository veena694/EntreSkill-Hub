import request from 'supertest';
import app from '../app';
import { getPrismaClient } from '../config/prisma';

let prisma = getPrismaClient();

beforeAll(async () => {
  prisma = getPrismaClient();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean all user-related data
  await prisma.mentorBooking.deleteMany({});
  await prisma.mentor.deleteMany({});
  await prisma.progress.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.user.deleteMany({});
});

describe('User Isolation Tests', () => {
  const userAPayload = {
    email: 'usera@test.com',
    password: 'passwordA123',
    fullName: 'User Alpha',
    role: 'user'
  };

  const userBPayload = {
    email: 'userb@test.com',
    password: 'passwordB123',
    fullName: 'User Beta',
    role: 'user'
  };

  async function registerAndVerify(payload: { email: string; password: string; fullName: string; role: string }) {
    await request(app).post('/api/v1/auth/register').send(payload);
    // Auto-verify for testing
    await prisma.user.update({
      where: { email: payload.email },
      data: { isVerified: true }
    });
  }

  async function login(email: string, password: string) {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    return {
      accessToken: res.body.data.accessToken,
      refreshToken: res.body.data.refreshToken,
      user: res.body.data.user
    };
  }

  async function logout(refreshToken: string) {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send({ refreshToken });
    expect(res.status).toBe(200);
  }

  it('should register a new user with onboardingCompleted=false', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(userAPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.onboardingCompleted).toBe(false);
  });

  it('should return 401 for protected routes without JWT', async () => {
    const res = await request(app).get('/api/v1/users/profile');
    expect(res.status).toBe(401);
  });

  it('should return 401 for protected routes with invalid JWT', async () => {
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('should complete onboarding for authenticated user', async () => {
    await registerAndVerify(userAPayload);
    const { accessToken } = await login(userAPayload.email, userAPayload.password);

    const res = await request(app)
      .post('/api/v1/users/onboarding')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        skills: ['Sales', 'Marketing'],
        interests: ['Technology'],
        budget: 5000,
        experience: 'beginner',
        goals: ['Launch a startup']
      });

    expect(res.status).toBe(200);
    expect(res.body.data.onboardingCompleted).toBe(true);

    // Verify via profile endpoint
    const profileRes = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.onboardingCompleted).toBe(true);
    expect(profileRes.body.data.onboarding.skills).toEqual(['Sales', 'Marketing']);
  });

  it('should return fresh empty data for a newly registered user', async () => {
    await registerAndVerify(userAPayload);
    const { accessToken } = await login(userAPayload.email, userAPayload.password);

    // Check profile is genuinely fresh
    const profileRes = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(profileRes.status).toBe(200);
    const profile = profileRes.body.data;

    expect(profile.onboardingCompleted).toBe(false);
    expect(profile.onboarding.skills).toEqual([]);
    expect(profile.onboarding.interests).toEqual([]);
    expect(profile.achievements).toEqual([]);

    // Check dashboard is genuinely fresh
    const dashRes = await request(app)
      .get('/api/v1/users/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(dashRes.status).toBe(200);
    const dash = dashRes.body.data;

    expect(dash.fullName).toBe('User Alpha');
    expect(dash.activeRoadmapsCount).toBe(0);
    expect(dash.completedRoadmapsCount).toBe(0);
    expect(dash.completedCoursesCount).toBe(0);
    expect(dash.totalLearningHours).toBe(0);
  });

  it('MANDATORY: Two-user isolation test', async () => {
    // ──────────────────────────────────────────
    // User A: register, onboard, verify data
    // ──────────────────────────────────────────
    await registerAndVerify(userAPayload);
    const userASession = await login(userAPayload.email, userAPayload.password);

    // Complete onboarding for User A
    const onboardRes = await request(app)
      .post('/api/v1/users/onboarding')
      .set('Authorization', `Bearer ${userASession.accessToken}`)
      .send({
        skills: ['Agriculture', 'Sales'],
        interests: ['Food'],
        budget: 3000,
        experience: 'intermediate',
        goals: ['Open a farm']
      });
    expect(onboardRes.status).toBe(200);

    // Verify User A's profile
    const userAProfile = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${userASession.accessToken}`);

    expect(userAProfile.body.data.personalInfo.fullName).toBe('User Alpha');
    expect(userAProfile.body.data.onboardingCompleted).toBe(true);
    expect(userAProfile.body.data.onboarding.skills).toEqual(['Agriculture', 'Sales']);

    // Verify User A dashboard
    const userADash = await request(app)
      .get('/api/v1/users/dashboard')
      .set('Authorization', `Bearer ${userASession.accessToken}`);
    expect(userADash.body.data.fullName).toBe('User Alpha');

    // Logout User A
    await logout(userASession.refreshToken);

    // ──────────────────────────────────────────
    // User B: register, verify NO User A data
    // ──────────────────────────────────────────
    await registerAndVerify(userBPayload);
    const userBSession = await login(userBPayload.email, userBPayload.password);

    // Verify User B's profile is fresh
    const userBProfile = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${userBSession.accessToken}`);

    expect(userBProfile.body.data.personalInfo.fullName).toBe('User Beta');
    expect(userBProfile.body.data.onboardingCompleted).toBe(false);
    expect(userBProfile.body.data.onboarding.skills).toEqual([]);
    expect(userBProfile.body.data.onboarding.interests).toEqual([]);

    // Verify NO User A skills/progress in User B's profile
    expect(userBProfile.body.data.onboarding.skills).not.toContain('Agriculture');
    expect(userBProfile.body.data.onboarding.skills).not.toContain('Sales');

    // Verify User B dashboard is fresh (not User A's data)
    const userBDash = await request(app)
      .get('/api/v1/users/dashboard')
      .set('Authorization', `Bearer ${userBSession.accessToken}`);

    expect(userBDash.body.data.fullName).toBe('User Beta');
    expect(userBDash.body.data.fullName).not.toBe('User Alpha');
    expect(userBDash.body.data.activeRoadmapsCount).toBe(0);
    expect(userBDash.body.data.totalLearningHours).toBe(0);

    // Verify NO 'Alex Rivers' anywhere in responses
    const profileStr = JSON.stringify(userBProfile.body);
    expect(profileStr).not.toContain('Alex Rivers');
    expect(profileStr).not.toContain('Alex');

    const dashStr = JSON.stringify(userBDash.body);
    expect(dashStr).not.toContain('Alex Rivers');
    expect(dashStr).not.toContain('Alex');

    // Logout User B
    await logout(userBSession.refreshToken);

    // ──────────────────────────────────────────
    // Login User A again: verify data persists
    // ──────────────────────────────────────────
    const userASession2 = await login(userAPayload.email, userAPayload.password);

    const userAProfile2 = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${userASession2.accessToken}`);

    expect(userAProfile2.body.data.personalInfo.fullName).toBe('User Alpha');
    expect(userAProfile2.body.data.onboardingCompleted).toBe(true);
    expect(userAProfile2.body.data.onboarding.skills).toEqual(['Agriculture', 'Sales']);
    expect(userAProfile2.body.data.onboarding.interests).toEqual(['Food']);
    expect(userAProfile2.body.data.onboarding.budget).toBe(3000);

    // Verify User A's dashboard still shows their data
    const userADash2 = await request(app)
      .get('/api/v1/users/dashboard')
      .set('Authorization', `Bearer ${userASession2.accessToken}`);
    expect(userADash2.body.data.fullName).toBe('User Alpha');
  });

  it('should not contain Alex Rivers in any API response', async () => {
    await registerAndVerify(userAPayload);
    const { accessToken } = await login(userAPayload.email, userAPayload.password);

    const profileRes = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    const dashRes = await request(app)
      .get('/api/v1/users/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(JSON.stringify(profileRes.body)).not.toContain('Alex');
    expect(JSON.stringify(dashRes.body)).not.toContain('Alex');
  });

  it('should authenticate a user via Google OAuth and set onboardingCompleted=false for new users', async () => {
    const res = await request(app)
      .post('/api/v1/auth/google')
      .send({
        email: 'googleuser@test.com',
        fullName: 'Google Founder',
        googleId: '123456789'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe('googleuser@test.com');
    expect(res.body.data.user.onboardingCompleted).toBe(false);

    // Re-login same Google user -> should retrieve same account
    const reLoginRes = await request(app)
      .post('/api/v1/auth/google')
      .send({
        email: 'googleuser@test.com',
        fullName: 'Google Founder',
        googleId: '123456789'
      });

    expect(reLoginRes.status).toBe(200);
    expect(reLoginRes.body.data.user.userId).toBe(res.body.data.user.userId);
  });

  it('MANDATORY: Bookmark user isolation test', async () => {
    // Register User A & User B
    await registerAndVerify(userAPayload);
    await registerAndVerify(userBPayload);

    const userA = await login(userAPayload.email, userAPayload.password);
    const userB = await login(userBPayload.email, userBPayload.password);

    const testId = Date.now();
    const idea = await prisma.businessIdea.create({
      data: {
        title: `Bookmark Isolation Test Idea ${testId}`,
        slug: `bookmark-isolation-test-idea-${testId}`,
        description: 'Test description',
        shortDescription: 'Short test',
        category: 'Tech',
        expectedRevenue: '$1000',
        difficultyLevel: 'beginner',
        riskLevel: 'low',
        requiredSkills: [],
        requiredEquipment: [],
        marketDemand: 'High',
        successTips: [],
        commonChallenges: [],
        tags: []
      }
    });

    // User A bookmarks Idea
    const addRes = await request(app)
      .post(`/api/v1/users/bookmarks/${idea.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(addRes.status).toBe(200);
    expect(addRes.body.data.bookmarks).toContain(idea.id);

    // User A getBookmarks -> returns Idea
    const userABookmarks = await request(app)
      .get('/api/v1/users/bookmarks')
      .set('Authorization', `Bearer ${userA.accessToken}`);
    expect(userABookmarks.status).toBe(200);
    expect(userABookmarks.body.data.length).toBe(1);
    expect(userABookmarks.body.data[0].id).toBe(idea.id);

    // User B getBookmarks -> returns EMPTY array (User B does NOT see User A's bookmark!)
    const userBBookmarks = await request(app)
      .get('/api/v1/users/bookmarks')
      .set('Authorization', `Bearer ${userB.accessToken}`);
    expect(userBBookmarks.status).toBe(200);
    expect(userBBookmarks.body.data).toEqual([]);
  });
});

