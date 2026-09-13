import { useState, useEffect } from 'react';
import { slugPreview } from '../../utils/slugPreview';

const emptyValues = {
  title: '',
  slug: '',
  description: '',
  longDescription: '',
  coverImage: '',
  githubUrl: '',
  liveUrl: '',
  technologiesInput: '',
  featured: false,
  order: 0,
};

export default function ProjectForm({ mode, initialData, onSubmit, submitting, submitError }) {
  const [values, setValues] = useState(emptyValues);
  const [status, setStatus] = useState('draft');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [errors, setErrors] = useState({});
  const [coverImageError, setCoverImageError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValues({
        title: initialData.title || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        longDescription: initialData.longDescription || '',
        coverImage: initialData.coverImage || '',
        githubUrl: initialData.githubUrl || '',
        liveUrl: initialData.liveUrl || '',
        technologiesInput: Array.isArray(initialData.technologies) ? initialData.technologies.join(', ') : '',
        featured: Boolean(initialData.featured),
        order: initialData.order ?? 0,
      });
      setStatus(initialData.status || 'draft');
    }
  }, [initialData]);

  function handleTitleChange(e) {
    const title = e.target.value;
    setValues((v) => ({ ...v, title, slug: slugTouched ? v.slug : slugPreview(title) }));
  }

  function handleSlugChange(e) {
    setSlugTouched(true);
    setValues((v) => ({ ...v, slug: e.target.value }));
  }

  function handleChange(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setValues((v) => ({ ...v, [field]: value }));
    };
  }

  function validate() {
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = 'Title is required';
    if (!values.slug.trim()) nextErrors.slug = 'Slug is required';
    if (!values.description.trim()) nextErrors.description = 'Description is required';
    return nextErrors;
  }

  function buildPayload(targetStatus) {
    const technologies = values.technologiesInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      title: values.title.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
      longDescription: values.longDescription.trim(),
      coverImage: values.coverImage.trim() || undefined,
      githubUrl: values.githubUrl.trim() || undefined,
      liveUrl: values.liveUrl.trim() || undefined,
      technologies,
      featured: values.featured,
      order: Number(values.order) || 0,
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <label htmlFor="title" className={labelClass}>Title</label>
          <input id="title" type="text" value={values.title} onChange={handleTitleChange} className={inputClass} />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>Slug</label>
          <input id="slug" type="text" value={values.slug} onChange={handleSlugChange} className={inputClass} />
          {errors.slug && <p className={errorClass}>{errors.slug}</p>}
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="description" className={labelClass}>Short Description</label>
          <textarea
            id="description"
            rows={2}
            value={values.description}
            onChange={handleChange('description')}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">Shown on the project card. Up to 300 characters.</p>
          {errors.description && <p className={errorClass}>{errors.description}</p>}
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="longDescription" className={labelClass}>Full Description</label>
          <textarea
            id="longDescription"
            rows={5}
            value={values.longDescription}
            onChange={handleChange('longDescription')}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">Shown in the expanded detail view when a visitor clicks the card.</p>
        </div>

        <div>
          <label htmlFor="coverImage" className={labelClass}>Cover Image URL</label>
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
        </div>

        <div>
          <label htmlFor="technologies" className={labelClass}>Technologies</label>
          <input
            id="technologies"
            type="text"
            value={values.technologiesInput}
            onChange={handleChange('technologiesInput')}
            placeholder="React, Node.js, MongoDB"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">Comma-separated.</p>
        </div>

        <div>
          <label htmlFor="githubUrl" className={labelClass}>GitHub URL</label>
          <input
            id="githubUrl"
            type="text"
            value={values.githubUrl}
            onChange={handleChange('githubUrl')}
            placeholder="https://github.com/username/repo"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="liveUrl" className={labelClass}>Live Demo URL</label>
          <input
            id="liveUrl"
            type="text"
            value={values.liveUrl}
            onChange={handleChange('liveUrl')}
            placeholder="https://example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="order" className={labelClass}>Display Order</label>
          <input
            id="order"
            type="number"
            value={values.order}
            onChange={handleChange('order')}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">Lower numbers appear first.</p>
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="featured"
            type="checkbox"
            checked={values.featured}
            onChange={handleChange('featured')}
            className="size-4 rounded border-gray-300"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-900">
            Featured project
          </label>
        </div>

        {mode === 'edit' && (
          <div>
            <label htmlFor="status" className={labelClass}>Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        )}
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
