import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '../../utils/markdownComponents';
import { slugPreview } from '../../utils/slugPreview';

const emptyValues = {
  title: '',
  slug: '',
  excerpt: '',
  coverImage: '',
  tagsInput: '',
  content: '',
};

export default function PostForm({ mode, initialData, onSubmit, submitting, submitError }) {
  const [values, setValues] = useState(emptyValues);
  const [status, setStatus] = useState('draft');
  // In edit mode, treat the existing slug as intentional so an unrelated
  // title edit never silently rewrites a live URL. In create mode, the
  // slug is free to auto-follow the title until the admin touches it.
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [errors, setErrors] = useState({});
  const [coverImageError, setCoverImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValues({
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        coverImage: initialData.coverImage || '',
        tagsInput: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        content: initialData.content || '',
      });
      setStatus(initialData.status || 'draft');
    }
  }, [initialData]);

  function handleTitleChange(e) {
    const title = e.target.value;
    setValues((v) => ({
      ...v,
      title,
      slug: slugTouched ? v.slug : slugPreview(title),
    }));
  }

  function handleSlugChange(e) {
    setSlugTouched(true);
    setValues((v) => ({ ...v, slug: e.target.value }));
  }

  function handleChange(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required';
    if (!values.slug.trim()) nextErrors.slug = 'Slug is required';
    if (!values.excerpt.trim()) nextErrors.excerpt = 'Excerpt is required';
    if (!values.content.trim()) nextErrors.content = 'Content is required';
    return nextErrors;
  }

  function buildPayload(targetStatus) {
    const tags = values.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      title: values.title.trim(),
      slug: values.slug.trim(),
      excerpt: values.excerpt.trim(),
      coverImage: values.coverImage.trim() || undefined,
      tags,
      content: values.content,
      status: targetStatus,
    };
  }

  function handleSubmit(e, targetStatus) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(buildPayload(targetStatus));
  }

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
  const labelClass = 'block text-sm font-medium text-gray-900';
  const errorClass = 'mt-1 text-sm text-red-600';

  return (
    <form onSubmit={(e) => handleSubmit(e, mode === 'edit' ? status : 'draft')} noValidate>
      {submitError && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              type="text"
              value={values.title}
              onChange={handleTitleChange}
              className={inputClass}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p id="title-error" className={errorClass}>
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug
            </label>
            <input
              id="slug"
              type="text"
              value={values.slug}
              onChange={handleSlugChange}
              className={inputClass}
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={errors.slug ? 'slug-error' : undefined}
            />
            {errors.slug && (
              <p id="slug-error" className={errorClass}>
                {errors.slug}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="excerpt" className={labelClass}>
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              value={values.excerpt}
              onChange={handleChange('excerpt')}
              className={inputClass}
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={errors.excerpt ? 'excerpt-error' : undefined}
            />
            {errors.excerpt && (
              <p id="excerpt-error" className={errorClass}>
                {errors.excerpt}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="coverImage" className={labelClass}>
              Cover Image URL
            </label>
            <input
              id="coverImage"
              type="text"
              value={values.coverImage}
              onChange={(e) => {
                setCoverImageError(false);
                handleChange('coverImage')(e);
              }}
              placeholder="https://example.com/image.jpg"
              className={inputClass}
            />
            {values.coverImage && !coverImageError && (
              <img
                src={values.coverImage}
                alt="Cover preview"
                onError={() => setCoverImageError(true)}
                className="mt-3 h-32 w-full rounded-md border border-gray-200 object-cover"
              />
            )}
            {values.coverImage && coverImageError && (
              <p className="mt-2 text-sm text-gray-500">Image couldn't be loaded from this URL.</p>
            )}
          </div>

          <div>
            <label htmlFor="tags" className={labelClass}>
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={values.tagsInput}
              onChange={handleChange('tagsInput')}
              placeholder="React, JavaScript, MERN"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500">Comma-separated.</p>
          </div>

          {mode === 'edit' && (
            <div>
              <label htmlFor="status" className={labelClass}>
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between">
            <label htmlFor="content" className={labelClass}>
              Content
            </label>
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 lg:hidden"
            >
              {showPreview ? 'Show Editor' : 'Show Preview'}
            </button>
          </div>
          <p className="text-xs text-gray-500">Markdown supported.</p>

          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <textarea
              id="content"
              rows={18}
              value={values.content}
              onChange={handleChange('content')}
              className={`${inputClass} min-w-0 font-mono ${showPreview ? 'hidden lg:block' : ''}`}
              aria-invalid={Boolean(errors.content)}
              aria-describedby={errors.content ? 'content-error' : undefined}
            />
            <div
              className={`min-w-0 overflow-y-auto overflow-x-hidden rounded-md border border-gray-200 p-4 ${
                showPreview ? '' : 'hidden lg:block'
              }`}
            >
              {values.content.trim() ? (
                <ReactMarkdown components={markdownComponents}>{values.content}</ReactMarkdown>
              ) : (
                <p className="text-sm text-gray-400">Preview will appear here.</p>
              )}
            </div>
          </div>
          {errors.content && (
            <p id="content-error" className={errorClass}>
              {errors.content}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {mode === 'create' ? (
          <>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              {submitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={(e) => handleSubmit(e, 'published')}
              className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gray-900"
            >
              {submitting ? 'Saving...' : 'Publish'}
            </button>
          </>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    </form>
  );
}