const mongoose = require('mongoose');
const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { slugify, generateUniqueSlug } = require('../utils/slugify');
const { validatePostInput } = require('../utils/validatePost');

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------- Public ----------------

const getPublicPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
  Math.max(parseInt(req.query.limit, 10) || 10, 1),
  50
);
  const skip = (page - 1) * limit;

  const filter = { status: 'published' };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name')
      .select('title slug excerpt coverImage tags author publishedAt createdAt updatedAt'),
    Post.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const getPublicPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
    .populate('author', 'name')
    .select('title slug excerpt content coverImage tags author publishedAt createdAt updatedAt');

  if (!post) fail('Post not found', 404);

  res.status(200).json({ success: true, post });
});

// ---------------- Admin ----------------

const getAdminPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(
  Math.max(parseInt(req.query.limit, 10) || 10, 1),
  50
);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email'),
    Post.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const getAdminPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid post ID', 400);

  const post = await Post.findById(id).populate('author', 'name email');
  if (!post) fail('Post not found', 404);

  res.status(200).json({ success: true, post });
});

const createPost = asyncHandler(async (req, res) => {
  const errors = validatePostInput(req.body);
  if (errors.length) fail(errors.join('; '), 400);

  const { title, slug, excerpt, content, coverImage, tags, status } = req.body;

  const finalStatus = status === 'published' ? 'published' : 'draft';
  const slugSource = slug && slug.trim() ? slug : title;
  const finalSlug = await generateUniqueSlug(slugSource, Post);

  const post = await Post.create({
    title: title.trim(),
    slug: finalSlug,
    excerpt: excerpt.trim(),
    content,
    coverImage: coverImage || null,
    tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
    status: finalStatus,
    author: req.user.id, // never trust req.body.author
    publishedAt: finalStatus === 'published' ? new Date() : null,
  });

  res.status(201).json({ success: true, post });
});

const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid post ID', 400);

  const post = await Post.findById(id);
  if (!post) fail('Post not found', 404);

  const errors = validatePostInput(req.body, { partial: true });
  if (errors.length) fail(errors.join('; '), 400);

  const { title, slug, excerpt, content, coverImage, tags, status } = req.body;

  // Capture before mutating, so slug regeneration is based on an actual
  // title change rather than comparing against a slug that may already
  // carry a collision suffix (e.g. "-2") from creation time.
  const previousTitle = post.title;
  const titleChanged = title !== undefined && title.trim() !== previousTitle;

  if (title !== undefined) post.title = title.trim();
  if (excerpt !== undefined) post.excerpt = excerpt.trim();
  if (content !== undefined) post.content = content;
  if (coverImage !== undefined) post.coverImage = coverImage || null;
  if (tags !== undefined) {
    post.tags = Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [];
  }

  if (slug !== undefined && slug.trim()) {
    if (slugify(slug) !== post.slug) {
      post.slug = await generateUniqueSlug(slug, Post, post._id);
    }
  } else if (titleChanged) {
    post.slug = await generateUniqueSlug(post.title, Post, post._id);
  }

  if (status !== undefined) {
    if (status === 'published' && post.status !== 'published') {
      post.publishedAt = post.publishedAt || new Date();
    } else if (status === 'draft') {
      post.publishedAt = null;
    }
    post.status = status;
  }
  // author and createdAt are never read from req.body — untouched here

  await post.save();

  res.status(200).json({ success: true, post });
});

const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid post ID', 400);

  const post = await Post.findByIdAndDelete(id);
  if (!post) fail('Post not found', 404);

  res.status(200).json({ success: true, message: 'Post deleted' });
});

const publishPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid post ID', 400);

  const post = await Post.findById(id);
  if (!post) fail('Post not found', 404);

  post.status = 'published';
  post.publishedAt = post.publishedAt || new Date();
  await post.save();

  res.status(200).json({ success: true, post });
});

const unpublishPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid post ID', 400);

  const post = await Post.findById(id);
  if (!post) fail('Post not found', 404);

  post.status = 'draft';
  post.publishedAt = null;
  await post.save();

  res.status(200).json({ success: true, post });
});

module.exports = {
  getPublicPosts,
  getPublicPostBySlug,
  getAdminPosts,
  getAdminPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
};