const mongoose = require('mongoose');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { validateContactInput, ALLOWED_MESSAGE_STATUSES } = require('../utils/validateMessage');

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

const submitMessage = asyncHandler(async (req, res) => {
  const errors = validateContactInput(req.body);
  if (errors.length) fail(errors.join('; '), 400);

  const { name, email, subject, message } = req.body;

  await Message.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject ? subject.trim() : '',
    message: message.trim(),
  });

  res.status(201).json({ success: true, message: "Thanks — I'll get back to you soon." });
});

// ---------------- Admin ----------------

const getAdminMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status && ALLOWED_MESSAGE_STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Message.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    messages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  });
});

const getAdminMessageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid message ID', 400);

  const message = await Message.findById(id);
  if (!message) fail('Message not found', 404);

  res.status(200).json({ success: true, message });
});

const updateMessageStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid message ID', 400);

  const { status } = req.body || {};
  if (!ALLOWED_MESSAGE_STATUSES.includes(status)) {
    fail(`Status must be one of: ${ALLOWED_MESSAGE_STATUSES.join(', ')}`, 400);
  }

  const message = await Message.findById(id);
  if (!message) fail('Message not found', 404);

  message.status = status;
  await message.save();

  res.status(200).json({ success: true, message });
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) fail('Invalid message ID', 400);

  const message = await Message.findByIdAndDelete(id);
  if (!message) fail('Message not found', 404);

  res.status(200).json({ success: true, message: 'Message deleted' });
});

module.exports = {
  submitMessage,
  getAdminMessages,
  getAdminMessageById,
  updateMessageStatus,
  deleteMessage,
};
