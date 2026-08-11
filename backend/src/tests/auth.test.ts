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
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
});

describe('Authentication API Endpoints', () => {
  const registerPayload = {
    email: 'founder@test.com',
    password: 'securePassword123',
    fullName: 'Jane Test',
    role: 'user'
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(registerPayload.email.toLowerCase());
    expect(res.body.data.role).toBe('user');
  });

  it('should not register user with an existing email', async () => {
    await request(app).post('/api/v1/auth/register').send(registerPayload);
    const res = await request(app).post('/api/v1/auth/register').send(registerPayload);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('should login user and return JWT tokens', async () => {
    await request(app).post('/api/v1/auth/register').send(registerPayload);
    
    // Set user as verified
    await prisma.user.update({
      where: { email: registerPayload.email },
      data: { isVerified: true }
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: registerPayload.email,
        password: registerPayload.password
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('should reject login for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'wrong@test.com',
        password: 'wrongPassword'
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
