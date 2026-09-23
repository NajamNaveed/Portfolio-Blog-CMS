const mongoose = require('mongoose');
const Job = require('../models/Job');
const JobCriteria = require('../models/JobCriteria');
const { getOrCreateJobCriteria } = JobCriteria;
const asyncHandler = require('../utils/asyncHandler');
const { runJobFetchPipeline } = require('../services/jobPipeline');
const { buildDedupeKey } = require('../services/jobMatcher');

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const ALLOWED_STATUSES = ['new', 'interested', 'applied', 'rejected', 'hidden'];
const ALLOWED_SOURCES = ['remotive', 'remoteok', 'arbeitnow', 'jobicy', 'himalayas', 'weworkremotely'];
const ALLOWED_WORK_TYPES = ['remote', 'onsite', 'both'];

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isLocationArray(value) {
  return (
    Array.isArray(value) &&
    value.every(
      (loc) =>
        loc &&
        typeof loc === 'object' &&
        ['country', 'state', 'city'].every((k) => loc[k] === undefined || typeof loc[k] === 'string')
    )
  );
}

// ---------------- Criteria ----------------

const getCriteria = asyncHandler(async (req, res) => {
  const criteria = await getOrCreateJobCriteria();
  res.status(200).json({ success: true, criteria });
});

const updateCriteria = asyncHandler(async (req, res) => {
  const { mustKeywords, niceKeywords, workType, locations, excludeKeywords, excludeCompanies, sources, scheduleTime } =
    req.body || {};
  const errors = [];

  if (mustKeywords !== undefined && !isStringArray(mustKeywords)) errors.push('mustKeywords must be an array of strings');
  if (niceKeywords !== undefined && !isStringArray(niceKeywords)) errors.push('niceKeywords must be an array of strings');
  if (excludeKeywords !== undefined && !isStringArray(excludeKeywords)) errors.push('excludeKeywords must be an array of strings');
  if (excludeCompanies !== undefined && !isStringArray(excludeCompanies)) errors.push('excludeCompanies must be an array of strings');
  if (locations !== undefined && !isLocationArray(locations)) errors.push('locations must be an array of {country, state, city} objects');
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
  if (mustKeywords !== undefined) criteria.mustKeywords = mustKeywords.map((k) => k.trim()).filter(Boolean);
  if (niceKeywords !== undefined) criteria.niceKeywords = niceKeywords.map((k) => k.trim()).filter(Boolean);
  if (excludeKeywords !== undefined) criteria.excludeKeywords = excludeKeywords.map((k) => k.trim()).filter(Boolean);
  if (excludeCompanies !== undefined) criteria.excludeCompanies = excludeCompanies.map((k) => k.trim()).filter(Boolean);
  if (locations !== undefined) {
    criteria.locations = locations
      .map((l) => ({ country: (l.country || '').trim(), state: (l.state || '').trim(), city: (l.city || '').trim() }))
      .filter((l) => l.country || l.state || l.city);
  }
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

  const sourceCounts = await Job.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]);
  const bySource = sourceCounts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  res.status(200).json({
    success: true,
    jobs,
    statusCounts,
    bySource,
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

const blockCompany = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid job ID', 400);

  const job = await Job.findById(id);
  if (!job) fail('Job not found', 404);

  const criteria = await getOrCreateJobCriteria();
  const alreadyBlocked = criteria.excludeCompanies.some((c) => c.toLowerCase() === job.company.toLowerCase());
  if (!alreadyBlocked) {
    criteria.excludeCompanies.push(job.company);
    await criteria.save();
  }

  // Hide every existing job from this company too, not just future ones.
  await Job.updateMany({ company: job.company, status: { $ne: 'hidden' } }, { status: 'hidden' });

  res.status(200).json({ success: true, blockedCompany: job.company });
});

const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid job ID', 400);

  const job = await Job.findByIdAndDelete(id);
  if (!job) fail('Job not found', 404);

  res.status(200).json({ success: true, message: 'Job deleted' });
});

const deleteAllJobs = asyncHandler(async (req, res) => {
  const result = await Job.deleteMany({});
  res.status(200).json({ success: true, deletedCount: result.deletedCount });
});

const deleteExpiredJobs = asyncHandler(async (req, res) => {
  const result = await Job.deleteMany({ expired: true });
  res.status(200).json({ success: true, deletedCount: result.deletedCount });
});

// Covers sources with no free API (e.g. Rozee.pk and other Pakistani
// boards) — paste in a listing by hand and it flows through the exact
// same status pipeline (New → Interested → Applied → ...) as fetched
// jobs, just without the AI relevance pass since you already chose it.
const addManualJob = asyncHandler(async (req, res) => {
  const { title, company, location, remote, url, description, tags } = req.body || {};

  if (typeof title !== 'string' || !title.trim()) fail('Title is required', 400);
  if (typeof company !== 'string' || !company.trim()) fail('Company is required', 400);
  if (typeof url !== 'string' || !url.trim()) fail('URL is required', 400);
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    fail('URL must be a valid URL', 400);
  }

  const job = await Job.create({
    title: title.trim().slice(0, 200),
    company: company.trim().slice(0, 150),
    location: typeof location === 'string' ? location.trim().slice(0, 200) : '',
    remote: Boolean(remote),
    url: url.trim(),
    description: typeof description === 'string' ? description.trim().slice(0, 2000) : '',
    tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 20) : [],
    source: 'manual',
    dedupeKey: buildDedupeKey({ title, company }),
    status: 'new',
  });

  res.status(201).json({ success: true, job });
});

const toggleAutoFetch = asyncHandler(async (req, res) => {
  const { enabled } = req.body || {};
  if (typeof enabled !== 'boolean') fail('enabled must be a boolean', 400);

  const criteria = await getOrCreateJobCriteria();
  criteria.autoFetchEnabled = enabled;
  await criteria.save();

  res.status(200).json({ success: true, autoFetchEnabled: criteria.autoFetchEnabled });
});

// ---------------- Run pipeline ----------------
// The admin "Run Now" button always runs, regardless of the auto-fetch
// toggle, since that's an explicit manual action. The external cron
// trigger (GitHub Actions) and the local scheduler both go through
// runFromCron instead, which respects the toggle.

const runNow = asyncHandler(async (req, res) => {
  const summary = await runJobFetchPipeline();
  res.status(200).json({ success: true, summary });
});

const runFromCron = asyncHandler(async (req, res) => {
  const criteria = await getOrCreateJobCriteria();
  if (!criteria.autoFetchEnabled) {
    return res.status(200).json({ success: true, skipped: true, message: 'Auto-fetch is turned off.' });
  }
  const summary = await runJobFetchPipeline();
  return res.status(200).json({ success: true, summary });
});

module.exports = {
  getCriteria,
  updateCriteria,
  toggleAutoFetch,
  getJobs,
  updateJobStatus,
  blockCompany,
  deleteJob,
  deleteAllJobs,
  deleteExpiredJobs,
  addManualJob,
  runNow,
  runFromCron,
};