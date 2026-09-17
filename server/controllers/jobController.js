const mongoose = require('mongoose');
const Job = require('../models/Job');
const JobCriteria = require('../models/JobCriteria');
const { getOrCreateJobCriteria } = JobCriteria;
const asyncHandler = require('../utils/asyncHandler');
const { runJobFetchPipeline } = require('../services/jobPipeline');

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const ALLOWED_STATUSES = ['new', 'interested', 'applied', 'rejected', 'hidden'];
const ALLOWED_SOURCES = ['remotive', 'remoteok', 'arbeitnow', 'jobicy'];
const ALLOWED_WORK_TYPES = ['remote', 'onsite', 'both'];

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

// ---------------- Criteria ----------------

const getCriteria = asyncHandler(async (req, res) => {
  const criteria = await getOrCreateJobCriteria();
  res.status(200).json({ success: true, criteria });
});

const updateCriteria = asyncHandler(async (req, res) => {
  const { keywords, workType, locations, excludeKeywords, sources, scheduleTime } = req.body || {};
  const errors = [];

  function isStringArray(value) {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
  }

  if (keywords !== undefined && !isStringArray(keywords)) errors.push('keywords must be an array of strings');
  if (excludeKeywords !== undefined && !isStringArray(excludeKeywords)) errors.push('excludeKeywords must be an array of strings');
  if (locations !== undefined && !isStringArray(locations)) errors.push('locations must be an array of strings');
  if (workType !== undefined && !ALLOWED_WORK_TYPES.includes(workType)) errors.push(`workType must be one of: ${ALLOWED_WORK_TYPES.join(', ')}`);
  if (sources !== undefined) {
    if (!Array.isArray(sources) || !sources.every((s) => ALLOWED_SOURCES.includes(s))) {
      errors.push(`sources must be an array from: ${ALLOWED_SOURCES.join(', ')}`);
    }
  }
  if (scheduleTime !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(scheduleTime)) {
    errors.push('scheduleTime must be in HH:mm 24h format');
  }

  if (errors.length) fail(errors.join('; '), 400);

  const criteria = await getOrCreateJobCriteria();
  if (keywords !== undefined) criteria.keywords = keywords.map((k) => k.trim()).filter(Boolean);
  if (excludeKeywords !== undefined) criteria.excludeKeywords = excludeKeywords.map((k) => k.trim()).filter(Boolean);
  if (locations !== undefined) criteria.locations = locations.map((l) => l.trim()).filter(Boolean);
  if (workType !== undefined) criteria.workType = workType;
  if (sources !== undefined) criteria.sources = sources;
  if (scheduleTime !== undefined) criteria.scheduleTime = scheduleTime;

  await criteria.save();
  res.status(200).json({ success: true, criteria });
});

// ---------------- Jobs ----------------

const getJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.status && ALLOWED_STATUSES.includes(req.query.status)) filter.status = req.query.status;

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const counts = await Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const statusCounts = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  res.status(200).json({
    success: true,
    jobs,
    statusCounts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const updateJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid job ID', 400);

  const { status } = req.body || {};
  if (!ALLOWED_STATUSES.includes(status)) fail(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`, 400);

  const job = await Job.findByIdAndUpdate(id, { status }, { new: true });
  if (!job) fail('Job not found', 404);

  res.status(200).json({ success: true, job });
});

const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid job ID', 400);

  const job = await Job.findByIdAndDelete(id);
  if (!job) fail('Job not found', 404);

  res.status(200).json({ success: true, message: 'Job deleted' });
});

// ---------------- Run pipeline ----------------
// Shared by the admin "Run Now" button (JWT-protected route) and the
// external cron trigger (secret-token-protected route) — both just call
// this handler via their own route/middleware stack.

const runNow = asyncHandler(async (req, res) => {
  const summary = await runJobFetchPipeline();
  res.status(200).json({ success: true, summary });
});

module.exports = {
  getCriteria,
  updateCriteria,
  getJobs,
  updateJobStatus,
  deleteJob,
  runNow,
};
