import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../dist/app.js';
import http from 'node:http';

let server;
let baseUrl = '';

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('1. Health Check Endpoint returns 200 and ONLINE status', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ONLINE');
});

test('2. Public Catalogue Browsing and Search', async () => {
  const res = await fetch(`${baseUrl}/api/videos`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.videos.length > 0, 'Videos should be present');
  assert.ok(data.total > 0, 'Total count should be positive');

  // Test search
  const searchRes = await fetch(`${baseUrl}/api/videos?search=chrono`);
  const searchData = await searchRes.json();
  assert.ok(searchData.videos.length > 0, 'Search should find CHRONO');
  assert.match(searchData.videos[0].title, /chrono/i);
});

test('3. Subscription Plans are accessible publicly', async () => {
  const res = await fetch(`${baseUrl}/api/plans`);
  assert.equal(res.status, 200);
  const plans = await res.json();
  assert.equal(plans.length, 3, 'Should have BASIC, STANDARD, and PREMIUM');
});

test('4. Authentication: Register new user', async () => {
  const email = `test_${Date.now()}@reelflix.com`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Viewer',
      email,
      password: 'SecurePassword123!',
    }),
  });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.token, 'Token should be returned');
  assert.equal(data.user.email, email);

  // Duplicate email registration should fail
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate',
      email,
      password: 'SecurePassword123!',
    }),
  });
  assert.equal(dupRes.status, 400);
});

test('5. Authentication: Login with valid credentials', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@reelflix.com',
      password: 'User@1234',
    }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.token);
  assert.equal(data.user.email, 'demo@reelflix.com');
});

test('6. Playback Authorization: Active subscriber receives session token', async () => {
  // Login as demo user (who has active Premium)
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@reelflix.com', password: 'User@1234' }),
  });
  const { token } = await loginRes.json();

  // Authorize video
  const authRes = await fetch(`${baseUrl}/api/playback/vid-chrono-paradox/authorize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  assert.equal(authRes.status, 200);
  const authData = await authRes.json();
  assert.ok(authData.sessionToken, 'Session token should be issued');
  assert.ok(authData.mediaUrl, 'Media stream URL should be provided');
});

test('7. Watchlist Operations: Add and check in watchlist', async () => {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@reelflix.com', password: 'User@1234' }),
  });
  const { token } = await loginRes.json();

  // Add video
  const addRes = await fetch(`${baseUrl}/api/watchlist/vid-neon-shadow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(addRes.status, 201);

  // Check in watchlist
  const checkRes = await fetch(`${baseUrl}/api/watchlist/check/vid-neon-shadow`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const checkData = await checkRes.json();
  assert.equal(checkData.inWatchlist, true);
});

test('8. Role-based Access Control: Admin endpoint blocks regular user', async () => {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@reelflix.com', password: 'User@1234' }),
  });
  const { token } = await loginRes.json();

  // Try accessing admin dashboard as USER
  const adminRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(adminRes.status, 403, 'Regular user should receive 403 Forbidden');

  // Login as ADMIN
  const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@reelflix.com', password: 'Admin@1234' }),
  });
  const { token: adminToken } = await adminLoginRes.json();

  const successAdminRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(successAdminRes.status, 200, 'Admin should receive 200 OK');
  const stats = await successAdminRes.json();
  assert.ok(stats.totalVideos >= 8);
});
