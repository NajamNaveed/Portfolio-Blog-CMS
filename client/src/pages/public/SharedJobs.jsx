import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Lock, Loader2 } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { viewSharedJobs } from '../../services/jobShareService';

export default function SharedJobs() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | needs-passcode | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [passcode, setPasscode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [label, setLabel] = useState('');
  const [jobs, setJobs] = useState([]);

  async function load(withPasscode) {
    try {
      const data = await viewSharedJobs(token, withPasscode);
      if (data.requiresPasscode) {
        setStatus('needs-passcode');
        return;
      }
      setLabel(data.label);
      setJobs(data.jobs);
      setStatus('success');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'This link is invalid, expired, or has been revoked.');
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handlePasscodeSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      await load(passcode);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink px-5 py-14 text-paper sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Shared Access</p>
        <h1 className="mt-2 font-display text-3xl text-paper">{label || 'Job Listings'}</h1>
        <p className="mt-2 text-sm text-stone">Read-only view — shared with you.</p>

        <div className="mt-10">
          {status === 'loading' && <LoadingSpinner />}

          {status === 'error' && (
            <div className="rounded-2xl border border-line bg-ink-soft p-8 text-center">
              <p className="text-stone">{errorMessage}</p>
            </div>
          )}

          {status === 'needs-passcode' && (
            <form
              onSubmit={handlePasscodeSubmit}
              className="mx-auto flex max-w-sm flex-col gap-4 rounded-2xl border border-line bg-ink-soft p-8"
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Lock className="size-5" />
              </span>
              <p className="text-center text-sm text-stone">This link is passcode protected.</p>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                autoFocus
                className="rounded-xl border border-line bg-ink px-4 py-3 text-center text-sm text-paper outline-none focus:border-accent"
              />
              {errorMessage && <p className="text-center text-xs text-red-400">{errorMessage}</p>}
              <button
                type="submit"
                disabled={submitting || !passcode}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                Unlock
              </button>
            </form>
          )}

          {status === 'success' && (
            <div className="flex flex-col gap-4">
              {jobs.length === 0 && <p className="text-sm text-stone">No jobs to show yet.</p>}
              {jobs.map((job) => (
                <div key={job._id} className="rounded-2xl border border-line bg-ink-soft p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg text-paper">{job.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${job.remote ? 'bg-accent/15 text-accent' : 'bg-line text-stone'}`}>
                      {job.remote ? 'Remote' : 'On-site'}
                    </span>
                    {job.expired && (
                      <span className="rounded-full bg-line px-2 py-0.5 text-xs text-stone">Expired</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-stone">
                    {job.company} {job.location ? `· ${job.location}` : ''}
                  </p>
                  {job.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.tags.slice(0, 6).map((tag) => (
                        <span key={tag} className="rounded-full border border-line px-2 py-0.5 text-xs text-stone">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dim"
                  >
                    View posting <ExternalLink className="size-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
