process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_URL = 'http://localhost:5173';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const os = require('os');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Post = require('../models/Post');

let mongoServer;
let admin;
let adminToken;

const validPost = (overrides = {}) => ({
  title: 'A useful testing post',
  excerpt: 'A concise summary for the testing post.',
  content: 'This is the complete article content used in API tests.',
  tags: ['testing', 'node'],
  ...overrides,
});

async function createPost(overrides = {}) {
  return Post.create({
    ...validPost(),
    slug: `post-${new mongoose.Types.ObjectId().toString()}`,
    author: admin._id,
    ...overrides,
  });
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { downloadDir: path.join(os.tmpdir(), 'cms-mongodb-binaries') },
  });
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Post.deleteMany({})]);
  admin = await User.create({
    name: 'Test Admin',
    email: 'admin@example.test',
    password: 'CorrectPassword123!',
  });
  adminToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('authentication', () => {
  test('logs in a valid admin', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'ADMIN@example.test',
      password: 'CorrectPassword123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      user: { email: 'admin@example.test', role: 'admin' },
    });
    expect(response.body.token).toEqual(expect.any(String));
  });

  test('rejects invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: admin.email,
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password');
  });

  test('rejects missing login fields', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: admin.email });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  test('rejects protected routes without a token', async () => {
    const response = await request(app).get('/api/admin/posts');

    expect(response.status).toBe(401);
  });

  test('rejects malformed and expired tokens', async () => {
    const malformed = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', 'Bearer not-a-jwt');
    const expiredToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: -1 });
    const expired = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(malformed.status).toBe(401);
    expect(expired.status).toBe(401);
  });

  test('rejects a valid token for a non-admin user', async () => {
    const userId = new mongoose.Types.ObjectId();
    await User.collection.insertOne({
      _id: userId,
      name: 'Non Admin',
      email: 'user@example.test',
      password: await bcrypt.hash('Password123!', 10),
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userToken = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const response = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Not authorized as admin');
  });
});

describe('admin post API', () => {
  test('creates a post and assigns the authenticated user as author', async () => {
    const otherUser = await User.create({
      name: 'Other Admin',
      email: 'other@example.test',
      password: 'Password123!',
    });
    const response = await request(app)
      .post('/api/admin/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPost({ author: otherUser._id.toString() }));

    expect(response.status).toBe(201);
    expect(response.body.post.author).toBe(admin._id.toString());
    expect(response.body.post.status).toBe('draft');
  });

  test('rejects post creation without authentication', async () => {
    const response = await request(app).post('/api/admin/posts').send(validPost());
    expect(response.status).toBe(401);
  });

  test.each([
    ['missing required fields', {}],
    ['invalid data types', validPost({ title: 42, tags: 'testing' })],
    ['empty title', validPost({ title: '   ' })],
    ['empty content', validPost({ content: '' })],
    ['invalid status', validPost({ status: 'archived' })],
  ])('rejects invalid post data: %s', async (_name, body) => {
    const response = await request(app)
      .post('/api/admin/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('lists all posts for an authenticated admin', async () => {
    await createPost({ title: 'Draft post', status: 'draft' });
    await createPost({ title: 'Published post', status: 'published', publishedAt: new Date() });

    const response = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.posts).toHaveLength(2);
  });

  test('gets an admin post by id and validates invalid ObjectIds', async () => {
    const post = await createPost();
    const found = await request(app)
      .get(`/api/admin/posts/${post._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const invalid = await request(app)
      .get('/api/admin/posts/not-an-object-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(found.status).toBe(200);
    expect(invalid.status).toBe(400);
  });

  test('edits a post while authenticated', async () => {
    const post = await createPost();
    const response = await request(app)
      .put(`/api/admin/posts/${post._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'An updated title', content: 'Updated complete article content.' });

    expect(response.status).toBe(200);
    expect(response.body.post).toMatchObject({
      title: 'An updated title',
      content: 'Updated complete article content.',
    });
  });

  test('rejects unauthenticated edits and deletes', async () => {
    const post = await createPost();
    const edit = await request(app).put(`/api/admin/posts/${post._id}`).send({ title: 'No access' });
    const deletion = await request(app).delete(`/api/admin/posts/${post._id}`);

    expect(edit.status).toBe(401);
    expect(deletion.status).toBe(401);
  });

  test('deletes a post while authenticated', async () => {
    const post = await createPost();
    const response = await request(app)
      .delete(`/api/admin/posts/${post._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(await Post.exists({ _id: post._id })).toBeNull();
  });

  test('publishes and unpublishes a post', async () => {
    const post = await createPost({ status: 'draft' });
    const published = await request(app)
      .patch(`/api/admin/posts/${post._id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`);
    const unpublished = await request(app)
      .patch(`/api/admin/posts/${post._id}/unpublish`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(published.body.post.status).toBe('published');
    expect(published.body.post.publishedAt).toEqual(expect.any(String));
    expect(unpublished.body.post.status).toBe('draft');
    expect(unpublished.body.post.publishedAt).toBeNull();
  });
});

describe('public posts and error handling', () => {
  test('returns only published posts publicly and hides drafts by slug', async () => {
    const published = await createPost({
      title: 'Published post',
      slug: 'published-post',
      status: 'published',
      publishedAt: new Date(),
    });
    await createPost({ title: 'Draft post', slug: 'draft-post', status: 'draft' });

    const listing = await request(app).get('/api/posts');
    const single = await request(app).get(`/api/posts/${published.slug}`);
    const draft = await request(app).get('/api/posts/draft-post');

    expect(listing.status).toBe(200);
    expect(listing.body.posts).toHaveLength(1);
    expect(listing.body.posts[0].slug).toBe('published-post');
    expect(single.status).toBe(200);
    expect(single.body.post.content).toBe(published.content);
    expect(draft.status).toBe(404);
  });

  test('returns 404 responses for unknown routes and missing posts', async () => {
    const route = await request(app).get('/api/does-not-exist');
    const post = await request(app).get('/api/posts/does-not-exist');

    expect(route.status).toBe(404);
    expect(route.body.message).toContain('Route not found');
    expect(post.status).toBe(404);
    expect(post.body.message).toBe('Post not found');
  });
});
