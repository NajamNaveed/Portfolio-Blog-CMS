const ALLOWED_STATUSES = ['draft', 'published'];
const ALLOWED_POST_FIELDS = ['title', 'slug', 'excerpt', 'content', 'coverImage', 'tags', 'status'];
const IGNORED_SERVER_MANAGED_FIELDS = [
  'author',
  '_id',
  'id',
  'createdAt',
  'updatedAt',
  'publishedAt',
  '__v',
  'role',
  'userId',
  'password',
];
const MAX_CONTENT_LENGTH = 100000;
const MAX_COVER_IMAGE_LENGTH = 2048;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;
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

// partial=true is used for updates, where a field may legitimately be absent
function validatePostInput(body, { partial = false } = {}) {
  const errors = [];

  if (!isPlainObject(body)) return ['Request body must be a JSON object'];

  const fields = Object.keys(body);
  const unexpectedFields = fields.filter(
    (field) => !ALLOWED_POST_FIELDS.includes(field) && !IGNORED_SERVER_MANAGED_FIELDS.includes(field)
  );
  if (unexpectedFields.length) {
    errors.push(`Unexpected field(s): ${unexpectedFields.join(', ')}`);
  }

  if (partial && !fields.some((field) => ALLOWED_POST_FIELDS.includes(field))) {
    errors.push('At least one post field is required');
  }

  const { title, excerpt, content, coverImage, tags, status } = body;

  if (!partial || title !== undefined) {
    validateRequiredString(title, 'Title', 200, errors);
  }

  if (!partial || excerpt !== undefined) {
    validateRequiredString(excerpt, 'Excerpt', 300, errors);
  }

  if (!partial || content !== undefined) {
    validateRequiredString(content, 'Content', MAX_CONTENT_LENGTH, errors);
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

  if (coverImage !== undefined && coverImage !== null && coverImage !== '') {
    if (typeof coverImage !== 'string') {
      errors.push('coverImage must be a valid URL');
    } else if (coverImage.length > MAX_COVER_IMAGE_LENGTH) {
      errors.push(`coverImage cannot exceed ${MAX_COVER_IMAGE_LENGTH} characters`);
    } else {
      try {
        const url = new URL(coverImage);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('coverImage must be a valid URL');
        }
      } catch {
        errors.push('coverImage must be a valid URL');
      }
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array of strings');
    } else if (tags.length > MAX_TAGS) {
      errors.push(`Tags cannot exceed ${MAX_TAGS} items`);
    } else if (
      !tags.every(
        (tag) => typeof tag === 'string' && tag.trim() && tag.trim().length <= MAX_TAG_LENGTH
      )
    ) {
      errors.push(`Tags must contain non-empty strings up to ${MAX_TAG_LENGTH} characters`);
    }
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  return errors;
}

module.exports = { validatePostInput, ALLOWED_STATUSES };
