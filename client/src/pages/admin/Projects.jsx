import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/admin/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getAllAdminProjects, deleteProject, publishProject, unpublishProject } from '../../services/projectService';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('loading');
  const [actionError, setActionError] = useState('');
  const [actioningId, setActioningId] = useState(null);

  async function fetchProjects() {
    setStatus('loading');
    try {
      const all = await getAllAdminProjects();
      setProjects(all);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleDelete(project) {
    const confirmed = window.confirm(`Are you sure you want to delete "${project.title}"?`);
    if (!confirmed) return;

    setActionError('');
    setActioningId(project._id);
    try {
      await deleteProject(project._id);
      await fetchProjects();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to delete this project.'));
    } finally {
      setActioningId(null);
    }
  }

  async function handleTogglePublish(project) {
    setActionError('');
    setActioningId(project._id);
    try {
      if (project.status === 'published') {
        await unpublishProject(project._id);
      } else {
        await publishProject(project._id);
      }
      await fetchProjects();
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to update this project.'));
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Projects</h1>
        <Link
          to="/admin/projects/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          New Project
        </Link>
      </div>

      {actionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="mt-6">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'error' && <ErrorMessage message="Couldn't load projects." onRetry={fetchProjects} />}
        {status === 'success' && projects.length === 0 && (
          <EmptyState message="No projects yet. Add your first project to get started." />
        )}

        {status === 'success' && projects.length > 0 && (
          <div className="flex flex-col gap-4">
            {projects.map((project) => (
              <div key={project._id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{project.title}</h3>
                      {project.featured && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Order {project.order} · Updated {formatDate(project.updatedAt)}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <Link
                    to={`/admin/projects/${project._id}/edit`}
                    className="rounded font-medium text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={actioningId === project._id}
                    onClick={() => handleTogglePublish(project)}
                    className="rounded font-medium text-gray-900 hover:underline focus-visible:ring-2 focus-visible:ring-gray-900 disabled:opacity-50"
                  >
                    {project.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    disabled={actioningId === project._id}
                    onClick={() => handleDelete(project)}
                    className="rounded font-medium text-red-700 hover:underline focus-visible:ring-2 focus-visible:ring-red-700 disabled:opacity-50"
                  >
                    Delete
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
