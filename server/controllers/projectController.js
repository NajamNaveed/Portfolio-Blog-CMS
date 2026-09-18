const mongoose = require('mongoose');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const { slugify, generateUniqueSlug } = require('../utils/slugify');
const { validateProjectInput } = require('../utils/validateProject');
const { callAI, isAIConfigured } = require('../services/aiClient');

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_PAGE = 100000;

function parsePaginationValue(value, defaultValue, maximum) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return defaultValue;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return defaultValue;
  return Math.min(parsed, maximum);
}

function getPagination(query) {
  const page = parsePaginationValue(query.page, DEFAULT_PAGE, MAX_PAGE);
  const limit = parsePaginationValue(query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

// ---------------- Public ----------------

const getPublicProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { status: 'published' };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort({ order: 1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('title slug description technologies coverImage githubUrl liveUrl featured order publishedAt createdAt')
      .lean(),
    Project.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    projects,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const getPublicProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published' }).select(
    'title slug description longDescription technologies coverImage githubUrl liveUrl featured publishedAt createdAt'
  );

  if (!project) fail('Project not found', 404);

  res.status(200).json({ success: true, project });
});

// ---------------- Admin ----------------

const getAdminProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [projects, total] = await Promise.all([
    Project.find({}).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).populate('author', 'name email').lean(),
    Project.countDocuments({}),
  ]);

  res.status(200).json({
    success: true,
    projects,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const getAdminProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid project ID', 400);

  const project = await Project.findById(id).populate('author', 'name email');
  if (!project) fail('Project not found', 404);

  res.status(200).json({ success: true, project });
});

const createProject = asyncHandler(async (req, res) => {
  const errors = validateProjectInput(req.body);
  if (errors.length) fail(errors.join('; '), 400);

  const { title, slug, description, longDescription, technologies, coverImage, githubUrl, liveUrl, featured, order, status } =
    req.body;

  const finalStatus = status === 'published' ? 'published' : 'draft';
  const slugSource = slug && slug.trim() ? slug : title;
  const finalSlug = await generateUniqueSlug(slugSource, Project);

  const project = await Project.create({
    title: title.trim(),
    slug: finalSlug,
    description: description.trim(),
    longDescription: longDescription || '',
    technologies: Array.isArray(technologies) ? technologies.map((t) => t.trim()).filter(Boolean) : [],
    coverImage: coverImage || null,
    githubUrl: githubUrl || null,
    liveUrl: liveUrl || null,
    featured: Boolean(featured),
    order: typeof order === 'number' ? order : 0,
    status: finalStatus,
    author: req.user.id,
    publishedAt: finalStatus === 'published' ? new Date() : null,
  });

  res.status(201).json({ success: true, project });
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid project ID', 400);

  const project = await Project.findById(id);
  if (!project) fail('Project not found', 404);

  const errors = validateProjectInput(req.body, { partial: true });
  if (errors.length) fail(errors.join('; '), 400);

  const { title, slug, description, longDescription, technologies, coverImage, githubUrl, liveUrl, featured, order, status } =
    req.body;

  const previousTitle = project.title;
  const titleChanged = title !== undefined && title.trim() !== previousTitle;

  if (title !== undefined) project.title = title.trim();
  if (description !== undefined) project.description = description.trim();
  if (longDescription !== undefined) project.longDescription = longDescription;
  if (coverImage !== undefined) project.coverImage = coverImage || null;
  if (githubUrl !== undefined) project.githubUrl = githubUrl || null;
  if (liveUrl !== undefined) project.liveUrl = liveUrl || null;
  if (featured !== undefined) project.featured = Boolean(featured);
  if (order !== undefined) project.order = order;
  if (technologies !== undefined) {
    project.technologies = Array.isArray(technologies) ? technologies.map((t) => t.trim()).filter(Boolean) : [];
  }

  if (slug !== undefined && slug.trim()) {
    if (slugify(slug) !== project.slug) {
      project.slug = await generateUniqueSlug(slug, Project, project._id);
    }
  } else if (titleChanged) {
    project.slug = await generateUniqueSlug(project.title, Project, project._id);
  }

  if (status !== undefined) {
    if (status === 'published' && project.status !== 'published') {
      project.publishedAt = project.publishedAt || new Date();
    } else if (status === 'draft') {
      project.publishedAt = null;
    }
    project.status = status;
  }

  await project.save();

  res.status(200).json({ success: true, project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid project ID', 400);

  const project = await Project.findByIdAndDelete(id);
  if (!project) fail('Project not found', 404);

  res.status(200).json({ success: true, message: 'Project deleted' });
});

const publishProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid project ID', 400);

  const project = await Project.findById(id);
  if (!project) fail('Project not found', 404);

  project.status = 'published';
  project.publishedAt = project.publishedAt || new Date();
  await project.save();

  res.status(200).json({ success: true, project });
});

const unpublishProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid project ID', 400);

  const project = await Project.findById(id);
  if (!project) fail('Project not found', 404);

  project.status = 'draft';
  project.publishedAt = null;
  await project.save();

  res.status(200).json({ success: true, project });
});

// ---------------- AI-assisted drafting ----------------

const GITHUB_URL_PATTERN = /github\.com\/([^/\s]+)\/([^/\s#?]+)/i;

const draftProjectFromRepo = asyncHandler(async (req, res) => {
  if (!isAIConfigured()) fail('AI drafting is not configured yet.', 503);

  const { repoUrl } = req.body || {};
  if (typeof repoUrl !== 'string' || !repoUrl.trim()) fail('repoUrl is required', 400);

  const match = repoUrl.match(GITHUB_URL_PATTERN);
  if (!match) fail('That does not look like a GitHub repository URL', 400);

  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'Portfolio-CMS' };

  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) fail(`Could not fetch repository details from GitHub (${repoRes.status})`, 400);
  const repoData = await repoRes.json();

  let readme = '';
  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      readme = Buffer.from(readmeData.content || '', 'base64').toString('utf-8').slice(0, 6000);
    }
  } catch {
    // README is a nice-to-have for the draft — its absence shouldn't fail the request.
  }

  const prompt = `Draft portfolio project copy for this GitHub repository. Respond with ONLY a JSON object (no markdown fences), shaped exactly like:
{"title": "...", "description": "... (max 200 characters, one enticing sentence)", "longDescription": "... (2-4 sentences, more detail)", "technologies": ["..."]}

Repository name: ${repoData.name}
Repository description: ${repoData.description || '(none provided)'}
Primary language: ${repoData.language || '(unknown)'}
Topics: ${(repoData.topics || []).join(', ') || '(none)'}

README (may be truncated):
${readme || '(no README found)'}`;

  const raw = await callAI({ prompt, temperature: 0.4, maxTokens: 600 });
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) fail('AI response could not be parsed. Try again.', 502);

  let draft;
  try {
    draft = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    fail('AI response could not be parsed. Try again.', 502);
  }

  res.status(200).json({
    success: true,
    draft: {
      title: draft.title || repoData.name,
      description: (draft.description || '').slice(0, 300),
      longDescription: draft.longDescription || '',
      technologies: Array.isArray(draft.technologies) ? draft.technologies.slice(0, 20) : [],
      githubUrl: repoData.html_url,
      liveUrl: repoData.homepage || '',
    },
  });
});

module.exports = {
  getPublicProjects,
  getPublicProjectBySlug,
  getAdminProjects,
  getAdminProjectById,
  createProject,
  updateProject,
  deleteProject,
  publishProject,
  unpublishProject,
  draftProjectFromRepo,
};
