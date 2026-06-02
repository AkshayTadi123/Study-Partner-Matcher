const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongod;
let token;
let userId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('POST /api/user/signup', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/user/signup')
      .send({ userName: 'testuser', password: 'Password1!', profileImage: 'http://img.com/a.png' });

    expect(res.status).toBe(200);
    expect(res.body.userName).toBe('testuser');
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('rejects duplicate userName', async () => {
    const res = await request(app)
      .post('/api/user/signup')
      .send({ userName: 'testuser', password: 'Password1!', profileImage: 'http://img.com/a.png' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/user/signup')
      .send({ userName: 'nopass' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/user/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ userName: 'testuser', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.userName).toBe('testuser');
    token = res.body.token;
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ userName: 'testuser', password: 'wrongpassword' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/incorrect password/i);
  });

  it('rejects unknown user', async () => {
    const res = await request(app)
      .post('/api/user/login')
      .send({ userName: 'nobody', password: 'Password1!' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/user (protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(401);
  });

  it('returns all users with valid token', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    userId = res.body[0]._id;
  });
});

describe('PATCH /api/user/:id (protected)', () => {
  it('updates user fields', async () => {
    const res = await request(app)
      .patch(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Test', lastName: 'User' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Test');
  });
});

describe('DELETE /api/user/:id (protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).delete(`/api/user/${userId}`);
    expect(res.status).toBe(401);
  });

  it('deletes user with valid token', async () => {
    const res = await request(app)
      .delete(`/api/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successfully/i);
  });
});
