import { test, expect } from '@playwright/test';

test.describe('EntreSkill Hub Backend E2E Journey API flows', () => {
  const testEmail = `founder-${Date.now()}@e2e.com`;
  let accessToken: string;
  let refreshToken: string;

  test('should handle complete user flow: register -> login -> dashboard -> logout', async ({ request }) => {
    // 1. Register User
    const regRes = await request.post('/api/v1/auth/register', {
      data: {
        email: testEmail,
        password: 'securePassword123',
        fullName: 'E2E Founder User',
        role: 'user'
      }
    });
    expect(regRes.status()).toBe(201);
    const regJson = await regRes.json();
    expect(regJson.success).toBe(true);

    // 2. Login User
    const loginRes = await request.post('/api/v1/auth/login', {
      data: {
        email: testEmail,
        password: 'securePassword123'
      }
    });
    expect(loginRes.status()).toBe(200);
    const loginJson = await loginRes.json();
    expect(loginJson.success).toBe(true);
    accessToken = loginJson.data.accessToken;
    refreshToken = loginJson.data.refreshToken;
    expect(accessToken).toBeDefined();

    // 3. View Dashboard
    const dashRes = await request.get('/api/v1/users/dashboard', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    expect(dashRes.status()).toBe(200);
    const dashJson = await dashRes.json();
    expect(dashJson.success).toBe(true);
    expect(dashJson.data.fullName).toBe('E2E Founder User');

    // 4. Logout User
    const logoutRes = await request.post('/api/v1/auth/logout', {
      data: { refreshToken }
    });
    expect(logoutRes.status()).toBe(200);
    const logoutJson = await logoutRes.json();
    expect(logoutJson.success).toBe(true);
  });
});
