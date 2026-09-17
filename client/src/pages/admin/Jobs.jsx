import { useEffect, useState } from 'react';
import { Plus, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';
import {
  getJobCriteria,
  updateJobCriteria,
  getJobs,
  updateJobStatus,
  deleteJob,
  runJobFetchNow,
} from '../../services/jobService';

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900';
const labelClass = 'block text-sm font-medium text-gray-900';

const STATUS_TABS = [
  { key: 'new', label: 'New' },
  { key: 'interested', label: 'Interested' },
  { key: 'applied', label: 'Applied' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'hidden', label: 'Hidden' },
];

const SOURCE_OPTIONS = ['remotive', 'remoteok', 'arbeitnow', 'jobicy'];

export default function Jobs() {
  const [tab, setTab] = useState('listings');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Jobs</h1>
        <div className="flex gap-2 rounded-md border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => setTab('listings')}
            className={`rounded px-3 py-1.5 text-sm font-medium ${tab === 'listings' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Listings
          </button>
          <button
            type="button"
            onClick={() => setTab('settings')}
            className={`rounded px-3 py-1.5 text-sm font-medium ${tab === 'settings' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="mt-6">{tab === 'listings' ? <JobListings /> : <JobSettings />}</div>
    </div>
  );
}

function JobListings() {
  const [statusFilter, setStatusFilter] = useState('new');
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('loading');
  const [actionError, setActionError] = useState('');
  const [running, setRunning] = useState(false);
  const [runSummary, setRunSummary] = useState(null);

  async function fetchJobs() {
    setStatus('loading');
    try {
      const data = await getJobs({ status: statusFilter, limit: 100 });
      setJobs(data.jobs);
      setCounts(data.statusCounts || {});
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleRunNow() {
    setRunning(true);
    setActionError('');
    setRunSummary(null);
    try {
      const summary = await runJobFetchNow();
      setRunSummary(summary);
      await fetchJobs();
    } catch (err) {
      setActionError(getErrorMessage(err, 'The job fetch failed to run.'));
    } finally {
      setRunning(false);
    }
  }

  async function handleStatusChange(job, nextStatus) {
    setActionError('');
    try {
      await updateJobStatus(job._id, nextStatus);
      setJobs((prev) => prev.filter((j) => j._id !== job._id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to update this job.'));
    }
  }

  async function handleDelete(job) {
    const confirmed = window.confirm(`Delete "${job.title}" at ${job.company}?`);
    if (!confirmed) return;
    setActionError('');
    try {
      await deleteJob(job._id);
      setJobs((prev) => prev.filter((j) => j._id !== job._id));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to delete this job.'));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                statusFilter === key ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label} {counts[key] ? `(${counts[key]})` : ''}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleRunNow}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Running…' : 'Run Now'}
        </button>
      </div>

      {runSummary && (
        <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Fetched {runSummary.fetched} listings, {runSummary.matchedCriteria} matched your criteria,{' '}
          {runSummary.inserted} new job{runSummary.inserted === 1 ? '' : 's'} added.
          {runSummary.errors?.length > 0 && (
            <span className="block mt-1 text-amber-700">{runSummary.errors.length} warning(s) — check server logs.</span>
          )}
        </div>
      )}

      {actionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      <div className="mt-6">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'error' && <ErrorMessage message="Couldn't load jobs." onRetry={fetchJobs} />}
        {status === 'success' && jobs.length === 0 && (
          <EmptyState message="No jobs here. Try Run Now, or check your criteria in Settings." />
        )}

        {status === 'success' && jobs.length > 0 && (
          <div className="flex flex-col gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <span className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-500">{job.source}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.remote ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {job.remote ? 'Remote' : 'On-site'}
                      </span>
                      {job.aiScore != null && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          AI match {Math.round(job.aiScore * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {job.company} {job.location ? `· ${job.location}` : ''}
                    </p>
                    {job.aiReason && <p className="mt-1 text-xs italic text-gray-400">"{job.aiReason}"</p>}
                    {job.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {job.tags.slice(0, 6).map((tag) => (
                          <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">{formatDate(job.createdAt)}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-gray-900 hover:underline"
                  >
                    View posting <ExternalLink className="size-3.5" />
                  </a>
                  {STATUS_TABS.filter(({ key }) => key !== statusFilter).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleStatusChange(job, key)}
                      className="rounded font-medium text-gray-600 hover:underline"
                    >
                      Mark {label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleDelete(job)}
                    className="ml-auto inline-flex items-center gap-1 rounded font-medium text-red-700 hover:underline"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobSettings() {
  const [criteria, setCriteria] = useState(null);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoadStatus('loading');
    try {
      const data = await getJobCriteria();
      setCriteria(data);
      setLoadStatus('success');
    } catch {
      setLoadStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(field, value) {
    setSaved(false);
    setCriteria((prev) => ({ ...prev, [field]: value }));
  }

  function updateTagList(field, index, value) {
    const next = [...(criteria[field] || [])];
    next[index] = value;
    updateField(field, next);
  }

  function addTag(field) {
    updateField(field, [...(criteria[field] || []), '']);
  }

  function removeTag(field, index) {
    updateField(
      field,
      (criteria[field] || []).filter((_, i) => i !== index)
    );
  }

  function toggleSource(source) {
    const current = criteria.sources || [];
    updateField('sources', current.includes(source) ? current.filter((s) => s !== source) : [...current, source]);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const payload = {
        keywords: (criteria.keywords || []).map((k) => k.trim()).filter(Boolean),
        excludeKeywords: (criteria.excludeKeywords || []).map((k) => k.trim()).filter(Boolean),
        locations: (criteria.locations || []).map((l) => l.trim()).filter(Boolean),
        workType: criteria.workType,
        sources: criteria.sources,
        scheduleTime: criteria.scheduleTime,
      };
      const updated = await updateJobCriteria(payload);
      setCriteria(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Unable to save job criteria.'));
    } finally {
      setSaving(false);
    }
  }

  if (loadStatus === 'loading') return <LoadingSpinner />;
  if (loadStatus === 'error') return <ErrorMessage message="Couldn't load job criteria." onRetry={load} />;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {criteria.lastRunAt && (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Last run: {formatDate(criteria.lastRunAt)} — {criteria.lastRunSummary}
        </div>
      )}

      {saveError && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>}
      {saved && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Settings saved.</div>}

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
        <p className="mt-1 text-sm text-gray-500">A job must match at least one of these (in its title, description, or tags) to be considered.</p>
        <div className="mt-4">
          <TagListEditor field="keywords" criteria={criteria} onChange={updateTagList} onAdd={addTag} onRemove={removeTag} placeholder="e.g. React" />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Exclude Keywords</h2>
        <p className="mt-1 text-sm text-gray-500">A job containing any of these will always be skipped, regardless of other matches.</p>
        <div className="mt-4">
          <TagListEditor field="excludeKeywords" criteria={criteria} onChange={updateTagList} onAdd={addTag} onRemove={removeTag} placeholder="e.g. Senior" />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Work Type</h2>
        <div className="mt-3 flex gap-4">
          {['remote', 'onsite', 'both'].map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="workType"
                checked={criteria.workType === type}
                onChange={() => updateField('workType', type)}
              />
              {type === 'remote' ? 'Remote only' : type === 'onsite' ? 'On-site only' : 'Both'}
            </label>
          ))}
        </div>
      </section>

      {criteria.workType !== 'remote' && (
        <section className="rounded-lg border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">On-site Locations</h2>
          <p className="mt-1 text-sm text-gray-500">Only used for on-site listings — remote jobs ignore this.</p>
          <div className="mt-4">
            <TagListEditor field="locations" criteria={criteria} onChange={updateTagList} onAdd={addTag} onRemove={removeTag} placeholder="e.g. Lahore" />
          </div>
        </section>
      )}

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Sources</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {SOURCE_OPTIONS.map((source) => (
            <label key={source} className="flex items-center gap-2 text-sm capitalize text-gray-700">
              <input type="checkbox" checked={criteria.sources?.includes(source)} onChange={() => toggleSource(source)} />
              {source}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900">Daily Schedule</h2>
        <p className="mt-1 text-sm text-gray-500">
          The time you want the daily automated fetch to run. This is informational — set the same time in your GitHub
          Actions workflow's cron schedule (see the setup guide).
        </p>
        <div className="mt-3 max-w-[200px]">
          <label className={labelClass}>Time (24h)</label>
          <input type="time" className={inputClass} value={criteria.scheduleTime} onChange={(e) => updateField('scheduleTime', e.target.value)} />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}

function TagListEditor({ field, criteria, onChange, onAdd, onRemove, placeholder }) {
  const items = criteria[field] || [];
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={inputClass} placeholder={placeholder} value={item} onChange={(e) => onChange(field, i, e.target.value)} />
          <button type="button" onClick={() => onRemove(field, i)} className="shrink-0 rounded-md p-2 text-red-600 hover:bg-red-50">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onAdd(field)}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-900"
      >
        <Plus className="size-4" /> Add
      </button>
    </div>
  );
}
