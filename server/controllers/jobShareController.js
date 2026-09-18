const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const JobShareLink = require('../models/JobShareLink');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

function fail(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---------------- Admin ----------------

const createShareLink = asyncHandler(async (req, res) => {
  const { label, expiresInDays, passcode } = req.body || {};

  if (expiresInDays !== undefined && expiresInDays !== null) {
    if (typeof expiresInDays !== 'number' || expiresInDays <= 0 || expiresInDays > 365) {
      fail('expiresInDays must be a number between 1 and 365, or omitted for no expiry', 400);
    }
  }
  if (passcode !== undefined && passcode !== null && passcode !== '') {
    if (typeof passcode !== 'string' || passcode.length < 4 || passcode.length > 50) {
      fail('passcode must be between 4 and 50 characters', 400);
    }
  }

  const token = crypto.randomBytes(24).toString('base64url');

  const link = await JobShareLink.create({
    token,
    label: typeof label === 'string' ? label.trim().slice(0, 100) : '',
    expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null,
    passcodeHash: passcode ? await bcrypt.hash(passcode, 10) : null,
  });

  res.status(201).json({ success: true, link: { ...link.toObject(), passcodeHash: undefined } });
});

const listShareLinks = asyncHandler(async (req, res) => {
  const links = await JobShareLink.find({}).select('-passcodeHash').sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, links });
});

const deleteShareLink = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid link ID', 400);

  const link = await JobShareLink.findByIdAndDelete(id);
  if (!link) fail('Share link not found', 404);

  res.status(200).json({ success: true, message: 'Share link revoked' });
});

// ---------------- Public (token-gated, not JWT) ----------------

const viewSharedJobs = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { passcode } = req.body || {};

  const link = await JobShareLink.findOne({ token });
  if (!link) fail('This link is invalid or has been revoked.', 404);

  if (link.expiresAt && link.expiresAt < new Date()) {
    fail('This link has expired.', 410);
  }

  if (link.passcodeHash) {
    if (!passcode) {
      return res.status(200).json({ success: true, requiresPasscode: true });
    }
    const valid = await bcrypt.compare(passcode, link.passcodeHash);
    if (!valid) fail('Incorrect passcode.', 401);
  }

  link.viewCount += 1;
  link.lastViewedAt = new Date();
  await link.save();

  const jobs = await Job.find({ status: { $ne: 'hidden' } })
    .sort({ createdAt: -1 })
    .select('title company location remote url tags source aiScore aiReason status createdAt expired')
    .lean();

  res.status(200).json({ success: true, requiresPasscode: false, label: link.label, jobs });
});

module.exports = { createShareLink, listShareLinks, deleteShareLink, viewSharedJobs };
