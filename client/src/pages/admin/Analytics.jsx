import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getAnalyticsSummary } from '../../services/analyticsService';

const EVENT_LABELS = {
  resume_download: 'Résumé Downloads',
  contact_cta: 'Contact CTA Clicks',
  view_projects_cta: 'View Projects Clicks',
  project_view: 'Project Detail Views',
  hero_cta: 'Hero CTA Clicks',
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  async function load() {
    setStatus('loading');
    try {
      const result = await getAnalyticsSummary();
      setData(result);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'error') return <ErrorMessage message="Couldn't load analytics." onRetry={load} />;

  const { totalsByEvent, allowedEvents } = data;
  const maxTotal = Math.max(1, ...Object.values(totalsByEvent));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">
        Résumé downloads and CTA clicks across the site. Events auto-expire after 180 days.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {allowedEvents.map((event) => {
          const count = totalsByEvent[event] || 0;
          const widthPct = Math.max(4, (count / maxTotal) * 100);
          return (
            <div key={event} className="rounded-lg border border-gray-200 p-5">
              <p className="text-sm text-gray-500">{EVENT_LABELS[event] || event}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gray-900" style={{ width: `${widthPct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
