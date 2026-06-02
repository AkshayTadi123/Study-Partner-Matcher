const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

let mongod;
let token;
let courseId;
let userId;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  // Create a user and get a token
  const signup = await request(app)
    .post('/api/user/signup')
    .send({ userName: 'coursetest', password: 'Password1!', profileImage: 'http://img.com/a.png' });
  token = signup.body.token;
  userId = (await request(app).get('/api/user').set('Authorization', `Bearer ${token}`)).body[0]._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('POST /api/course (protected)', () => {
  it('creates a course', async () => {
    const res = await request(app)
      .post('/api/course')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseCode: 'EECS3101' });

    expect(res.status).toBe(201);
    expect(res.body.courseCode).toBe('EECS3101');
    courseId = res.body._id;
  });

  it('rejects duplicate course code', async () => {
    const res = await request(app)
      .post('/api/course')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseCode: 'EECS3101' });

    expect(res.status).toBe(400);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/course').send({ courseCode: 'CS101' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/course', () => {
  it('returns all courses (public)', async () => {
    const res = await request(app).get('/api/course');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns a single course by id (public)', async () => {
    const res = await request(app).get(`/api/course/${courseId}`);
    expect(res.status).toBe(200);
    expect(res.body.courseCode).toBe('EECS3101');
  });

  it('returns 404 for unknown id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/course/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

describe('Course enrollment', () => {
  it('adds a student to a course', async () => {
    const res = await request(app)
      .post('/api/course/addStudent')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseID: courseId, userID: userId });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successfully/i);
  });

  it('rejects adding the same student twice', async () => {
    const res = await request(app)
      .post('/api/course/addStudent')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseID: courseId, userID: userId });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already enrolled/i);
  });

  it('removes a student from a course', async () => {
    const res = await request(app)
      .post('/api/course/removeStudent')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseID: courseId, userID: userId });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successfully/i);
  });

  it('rejects removing a non-enrolled student', async () => {
    const res = await request(app)
      .post('/api/course/removeStudent')
      .set('Authorization', `Bearer ${token}`)
      .send({ courseID: courseId, userID: userId });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not enrolled/i);
  });
});

describe('DELETE /api/course/:id (protected)', () => {
  it('deletes a course', async () => {
    const res = await request(app)
      .delete(`/api/course/${courseId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
