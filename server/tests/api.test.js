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
    expect(response.body.user).not.toHaveProperty('password');

    const claims = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(claims).toMatchObject({ id: admin._id.toString() });
    expect(claims).not.toHaveProperty('role');
    expect(claims).not.toHaveProperty('email');
    expect(claims).not.toHaveProperty('password');
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

  test.each([
    ['email', { password: 'CorrectPassword123!' }],
    ['password', { email: 'admin@example.test' }],
    ['empty email', { email: '   ', password: 'CorrectPassword123!' }],
    ['empty password', { email: 'admin@example.test', password: '' }],
  ])('rejects a missing or empty %s', async (_field, body) => {
    const response = await request(app).post('/api/auth/login').send(body);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password are required');
  });

  test('rejects non-string login credentials without attempting normalization', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: { value: admin.email },
      password: 123456,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email and password must be strings');
  });

  test('rejects a malformed email before querying for a user', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'not-an-email',
      password: 'CorrectPassword123!',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email must be a valid email address');
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

  test('rejects malformed Authorization headers and an empty Bearer token', async () => {
    const basic = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', 'Basic credentials');
    const emptyBearer = await request(app).get('/api/admin/posts').set('Authorization', 'Bearer');
    const extraParts = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', 'Bearer token with-extra-data');

    for (const response of [basic, emptyBearer, extraParts]) {
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Not authorized, invalid authorization header');
    }
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
    const userToken = jwt.sign({ id: userId, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const response = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Not authorized as admin');
  });

  test('rejects a token after its user has been deleted', async () => {
    await User.deleteOne({ _id: admin._id });

    const response = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Not authorized, invalid or expired token');
  });

  test('limits repeated login attempts using the forwarded client IP', async () => {
    const attempts = [];
    for (let attempt = 0; attempt < 11; attempt += 1) {
      attempts.push(
        request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', '198.51.100.42')
          .send({ email: admin.email, password: 'wrong-password' })
      );
    }

    const responses = await Promise.all(attempts);
    const rateLimited = responses.filter((response) => response.status === 429);

    expect(responses.filter((response) => response.status === 401)).toHaveLength(10);
    expect(rateLimited).toHaveLength(1);
    expect(rateLimited[0].body).toEqual({
      success: false,
      message: 'Too many login attempts. Please try again later.',
    });
  });

  test('does not expose auth error stacks in production mode', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const response = await request(app).get('/api/admin/posts');
      expect(response.status).toBe(401);
      expect(response.body).not.toHaveProperty('stack');
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
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
    ['excessively long title', validPost({ title: 'a'.repeat(201) })],
    ['invalid status', validPost({ status: 'archived' })],
    ['invalid slug', validPost({ slug: 'Not a valid slug!' })],
    ['invalid tag values', validPost({ tags: ['valid', ' '] })],
    ['invalid cover image URL', validPost({ coverImage: 'javascript:alert(1)' })],
    ['unexpected field', validPost({ internalFlag: true })],
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

  test('paginates admin posts with defaults, bounds, metadata, and both statuses', async () => {
    for (let index = 0; index < 12; index += 1) {
      await createPost({
        title: `Admin post ${index}`,
        status: index % 2 === 0 ? 'draft' : 'published',
        publishedAt: index % 2 === 0 ? null : new Date(`2024-01-${String(index + 1).padStart(2, '0')}`),
      });
    }

    const firstPage = await request(app)
      .get('/api/admin/posts')
      .set('Authorization', `Bearer ${adminToken}`);
    const customPage = await request(app)
      .get('/api/admin/posts?page=2&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);
    const maximum = await request(app)
      .get('/api/admin/posts?page=1&limit=999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(firstPage.body.pagination).toEqual({ page: 1, limit: 10, total: 12, pages: 2 });
    expect(firstPage.body.posts).toHaveLength(10);
    expect(customPage.body.pagination).toEqual({ page: 2, limit: 2, total: 12, pages: 6 });
    expect(customPage.body.posts).toHaveLength(2);
    expect(maximum.body.pagination).toEqual({ page: 1, limit: 50, total: 12, pages: 1 });
    expect(maximum.body.posts).toHaveLength(12);
    expect(maximum.body.posts.map((post) => post.status)).toEqual(
      expect.arrayContaining(['draft', 'published'])
    );
  });

  test.each([
    ['zero values', '0', '0'],
    ['negative values', '-2', '-5'],
    ['non-numeric and decimal values', 'abc', '2.5'],
    ['extremely large values', '999999999999999999999', '999999'],
  ])('normalizes invalid admin pagination values: %s', async (_name, page, limit) => {
    await createPost();

    const response = await request(app)
      .get(`/api/admin/posts?page=${page}&limit=${limit}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const expectedPage = 1;
    const expectedLimit = limit === '999999' ? 50 : 10;
    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(expectedPage);
    expect(response.body.pagination.limit).toBe(expectedLimit);
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

  test.each([
    ['an invalid field type', { title: 42 }],
    ['an invalid status', { status: 'archived' }],
    ['invalid content', { content: '   ' }],
    ['an unexpected field', { internalFlag: true }],
  ])('rejects updates with %s', async (_name, body) => {
    const post = await createPost();
    const response = await request(app)
      .put(`/api/admin/posts/${post._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('returns controlled errors for malformed and nonexistent admin post IDs', async () => {
    const malformed = await request(app)
      .put('/api/admin/posts/not-an-object-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated title' });
    const nonexistent = await request(app)
      .get(`/api/admin/posts/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(malformed.status).toBe(400);
    expect(malformed.body.message).toBe('Invalid post ID');
    expect(nonexistent.status).toBe(404);
    expect(nonexistent.body.message).toBe('Post not found');
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

  test('paginates published posts, sorts by publication date, and excludes drafts', async () => {
    await createPost({
      title: 'Old published post',
      slug: 'old-published-post',
      status: 'published',
      publishedAt: new Date('2024-01-01'),
    });
    await createPost({
      title: 'Draft post',
      slug: 'pagination-draft-post',
      status: 'draft',
      publishedAt: null,
    });
    await createPost({
      title: 'Newest published post',
      slug: 'newest-published-post',
      status: 'published',
      publishedAt: new Date('2024-03-01'),
    });
    await createPost({
      title: 'Middle published post',
      slug: 'middle-published-post',
      status: 'published',
      publishedAt: new Date('2024-02-01'),
    });

    const firstPage = await request(app).get('/api/posts?page=1&limit=2');
    const secondPage = await request(app).get('/api/posts?page=2&limit=2');
    const beyondResults = await request(app).get('/api/posts?page=3&limit=2');

    expect(firstPage.body.pagination).toEqual({ page: 1, limit: 2, total: 3, pages: 2 });
    expect(firstPage.body.posts.map((post) => post.slug)).toEqual([
      'newest-published-post',
      'middle-published-post',
    ]);
    expect(secondPage.body.posts.map((post) => post.slug)).toEqual(['old-published-post']);
    expect(beyondResults.body.pagination).toEqual({ page: 3, limit: 2, total: 3, pages: 2 });
    expect(beyondResults.body.posts).toEqual([]);
    expect(firstPage.body.posts.map((post) => post.slug)).not.toContain('pagination-draft-post');
  });

  test('uses safe public pagination defaults and maximums for invalid values', async () => {
    await createPost({ status: 'published', publishedAt: new Date() });

    const defaults = await request(app).get('/api/posts?page=not-a-number&limit=2.5');
    const maximum = await request(app).get('/api/posts?page=1&limit=999999');

    expect(defaults.body.pagination).toMatchObject({ page: 1, limit: 10, total: 1, pages: 1 });
    expect(maximum.body.pagination).toMatchObject({ page: 1, limit: 50, total: 1, pages: 1 });
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
