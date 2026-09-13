import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ProjectForm from '../../components/admin/ProjectForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAdminProject, updateProject } from '../../services/projectService';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loadStatus, setLoadStatus] = useState('loading');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoadStatus('loading');
      try {
        const data = await getAdminProject(id);
        if (!ignore) {
          setProject(data.project);
          setLoadStatus('success');
        }
      } catch (err) {
        const notFoundStatuses = [400, 404];
        if (!ignore) {
          setLoadStatus(notFoundStatuses.includes(err.response?.status) ? 'notfound' : 'error');
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError('');
    try {
      await updateProject(id, payload);
      navigate('/admin/projects');
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Unable to save changes. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadStatus === 'loading') return <LoadingSpinner />;

  if (loadStatus === 'notfound') {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Project not found</h1>
        <Link to="/admin/projects" className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (loadStatus === 'error') {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-700">Couldn't load this project.</p>
        <Link to="/admin/projects" className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Edit Project</h1>
      <div className="mt-6">
        <ProjectForm
          mode="edit"
          initialData={project}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
}
