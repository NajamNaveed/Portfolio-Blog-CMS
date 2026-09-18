import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import ProjectForm from '../../components/admin/ProjectForm';
import { createProject, draftProjectFromRepo } from '../../services/projectService';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function CreateProject() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [draft, setDraft] = useState(null);

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

  async function handleDraft(e) {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setDrafting(true);
    setDraftError('');
    try {
      const data = await draftProjectFromRepo(repoUrl.trim());
      setDraft(data.draft);
    } catch (err) {
      setDraftError(getErrorMessage(err, 'Could not draft from that repository.'));
    } finally {
      setDrafting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Add Project</h1>

      <form
        onSubmit={handleDraft}
        className="mt-6 flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 sm:flex-row sm:items-center"
      >
        <div className="flex-1">
          <label htmlFor="repoUrl" className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
            <Sparkles className="size-4 text-gray-500" /> AI-draft from a GitHub repo (optional)
          </label>
          <input
            id="repoUrl"
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
            className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={drafting || !repoUrl.trim()}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6"
        >
          {drafting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {drafting ? 'Drafting…' : 'Draft with AI'}
        </button>
      </form>
      {draftError && <p className="mt-2 text-sm text-red-600">{draftError}</p>}
      {draft && !draftError && (
        <p className="mt-2 text-sm text-green-700">Draft filled in below — review and edit before saving.</p>
      )}

      <div className="mt-6">
        <ProjectForm mode="create" initialData={draft} onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />
      </div>
    </div>
  );
}
