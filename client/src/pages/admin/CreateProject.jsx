import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../../components/admin/ProjectForm';
import { createProject } from '../../services/projectService';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function CreateProject() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError('');
    try {
      await createProject(payload);
      navigate('/admin/projects');
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Unable to save the project. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Add Project</h1>
      <div className="mt-6">
        <ProjectForm mode="create" onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />
      </div>
    </div>
  );
}
