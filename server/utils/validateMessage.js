const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_MESSAGE_FIELDS = ['name', 'email', 'subject', 'message'];

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateContactInput(body) {
  const errors = [];

  if (!isPlainObject(body)) return ['Request body must be a JSON object'];

  const fields = Object.keys(body);
  const unexpectedFields = fields.filter((field) => !ALLOWED_MESSAGE_FIELDS.includes(field));
  if (unexpectedFields.length) {
    errors.push(`Unexpected field(s): ${unexpectedFields.join(', ')}`);
  }

  const { name, email, subject, message } = body;

  if (typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length > 120) {
    errors.push('Name cannot exceed 120 characters');
  }

  if (typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (email.trim().length > 254 || !EMAIL_PATTERN.test(email.trim())) {
    errors.push('Email must be a valid email address');
  }

  if (subject !== undefined && subject !== null) {
    if (typeof subject !== 'string') {
      errors.push('Subject must be a string');
    } else if (subject.length > 200) {
      errors.push('Subject cannot exceed 200 characters');
    }
  }

  if (typeof message !== 'string' || !message.trim()) {
    errors.push('Message is required');
  } else if (message.trim().length > 5000) {
    errors.push('Message cannot exceed 5000 characters');
  } else if (message.trim().length < 5) {
    errors.push('Message is too short');
  }

  return errors;
}

const ALLOWED_MESSAGE_STATUSES = ['new', 'read', 'replied'];

module.exports = { validateContactInput, ALLOWED_MESSAGE_STATUSES };
