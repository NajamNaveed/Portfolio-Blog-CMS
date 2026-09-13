const ALLOWED_STATUSES = ['draft', 'published'];
const ALLOWED_PROJECT_FIELDS = [
  'title',
  'slug',
  'description',
  'longDescription',
  'technologies',
  'coverImage',
  'githubUrl',
  'liveUrl',
  'featured',
  'order',
  'status',
];
const IGNORED_SERVER_MANAGED_FIELDS = ['author', '_id', 'id', 'createdAt', 'updatedAt', 'publishedAt', '__v'];
const MAX_LONG_DESCRIPTION_LENGTH = 20000;
const MAX_URL_LENGTH = 2048;
const MAX_TECHNOLOGIES = 20;
const MAX_TECHNOLOGY_LENGTH = 40;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateRequiredString(value, fieldName, maxLength, errors) {
  if (value === undefined || value === null || value === '') {
    errors.push(`${fieldName} is required`);
  } else if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
  } else if (!value.trim()) {
    errors.push(`${fieldName} is required`);
  } else if (maxLength && value.trim().length > maxLength) {
    errors.push(`${fieldName} cannot exceed ${maxLength} characters`);
  }
}

function validateOptionalUrl(value, fieldName, errors) {
  if (value === undefined || value === null || value === '') return;
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a valid URL`);
    return;
  }
  if (value.length > MAX_URL_LENGTH) {
    errors.push(`${fieldName} cannot exceed ${MAX_URL_LENGTH} characters`);
    return;
  }
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push(`${fieldName} must be a valid URL`);
    }
  } catch {
    errors.push(`${fieldName} must be a valid URL`);
  }
}

function validateProjectInput(body, { partial = false } = {}) {
  const errors = [];

  if (!isPlainObject(body)) return ['Request body must be a JSON object'];

  const fields = Object.keys(body);
  const unexpectedFields = fields.filter(
    (field) => !ALLOWED_PROJECT_FIELDS.includes(field) && !IGNORED_SERVER_MANAGED_FIELDS.includes(field)
  );
  if (unexpectedFields.length) {
    errors.push(`Unexpected field(s): ${unexpectedFields.join(', ')}`);
  }

  if (partial && !fields.some((field) => ALLOWED_PROJECT_FIELDS.includes(field))) {
    errors.push('At least one project field is required');
  }

  const { title, description, longDescription, coverImage, technologies, githubUrl, liveUrl, featured, order, status } =
    body;

  if (!partial || title !== undefined) {
    validateRequiredString(title, 'Title', 150, errors);
  }

  if (!partial || description !== undefined) {
    validateRequiredString(description, 'Description', 300, errors);
  }

  if (longDescription !== undefined && longDescription !== null) {
    if (typeof longDescription !== 'string') {
      errors.push('Long description must be a string');
    } else if (longDescription.length > MAX_LONG_DESCRIPTION_LENGTH) {
      errors.push(`Long description cannot exceed ${MAX_LONG_DESCRIPTION_LENGTH} characters`);
    }
  }

  if (body.slug !== undefined) {
    if (typeof body.slug !== 'string') {
      errors.push('Slug must be a string');
    } else if (body.slug.trim()) {
      const slug = body.slug.trim();
      if (slug.length > 200) {
        errors.push('Slug cannot exceed 200 characters');
      } else if (!SLUG_PATTERN.test(slug)) {
        errors.push('Slug must use lowercase letters, numbers, and hyphens only');
      }
    }
  }

  validateOptionalUrl(coverImage, 'Cover image', errors);
  validateOptionalUrl(githubUrl, 'GitHub URL', errors);
  validateOptionalUrl(liveUrl, 'Live URL', errors);

  if (technologies !== undefined) {
    if (!Array.isArray(technologies)) {
      errors.push('Technologies must be an array of strings');
    } else if (technologies.length > MAX_TECHNOLOGIES) {
      errors.push(`Technologies cannot exceed ${MAX_TECHNOLOGIES} items`);
    } else if (
      !technologies.every(
        (tech) => typeof tech === 'string' && tech.trim() && tech.trim().length <= MAX_TECHNOLOGY_LENGTH
      )
    ) {
      errors.push(`Technologies must contain non-empty strings up to ${MAX_TECHNOLOGY_LENGTH} characters`);
    }
  }

  if (featured !== undefined && typeof featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }

  if (order !== undefined && (typeof order !== 'number' || !Number.isFinite(order))) {
    errors.push('Order must be a number');
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  return errors;
}

module.exports = { validateProjectInput, ALLOWED_STATUSES };
