const ALLOWED_STATUSES = ['draft', 'published'];

// partial=true is used for updates, where a field may legitimately be absent
function validatePostInput(body, { partial = false } = {}) {
  const errors = [];
  const { title, excerpt, content, coverImage, tags, status } = body;

  if (!partial || title !== undefined) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      errors.push('Title is required');
    } else if (title.trim().length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }
  }

  if (!partial || excerpt !== undefined) {
    if (!excerpt || typeof excerpt !== 'string' || !excerpt.trim()) {
      errors.push('Excerpt is required');
    } else if (excerpt.trim().length > 300) {
      errors.push('Excerpt cannot exceed 300 characters');
    }
  }

  if (!partial || content !== undefined) {
    if (!content || typeof content !== 'string' || !content.trim()) {
      errors.push('Content is required');
    }
  }

  if (coverImage !== undefined && coverImage !== null && coverImage !== '') {
    try {
      // eslint-disable-next-line no-new
      new URL(coverImage);
    } catch {
      errors.push('coverImage must be a valid URL');
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string')) {
      errors.push('Tags must be an array of strings');
    }
  }

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${ALLOWED_STATUSES.join(', ')}`);
  }

  return errors;
}

module.exports = { validatePostInput, ALLOWED_STATUSES };