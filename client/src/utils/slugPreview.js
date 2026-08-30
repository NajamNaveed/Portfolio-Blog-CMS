// Client-side preview only — mirrors the backend's normalization closely
// enough for a live preview, but the server's slugify.js remains the
// source of truth (including collision handling, which this doesn't do).
export function slugPreview(title = '') {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}