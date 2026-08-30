import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PostForm from '../../components/admin/PostForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAdminPost, updatePost } from '../../services/postService';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | success | notfound | error
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoadStatus('loading');
      try {
        // GET /api/admin/posts/:id — unlike the public slug endpoint, this
        // returns the post regardless of status, so drafts are editable.
        const data = await getAdminPost(id);
        if (!ignore) {
          setPost(data.post);
          setLoadStatus('success');
        }
      } catch (err) {
        // 404 = post doesn't exist; 400 = malformed id (e.g. a stale or
        // hand-edited URL). Both mean "there's nothing to edit here" from
        // the admin's point of view, so both get the same friendly state.
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
      // payload never includes `author` or `createdAt` — the backend
      // ignores/derives these server-side regardless of what's sent.
      await updatePost(id, payload);
      navigate('/admin/posts');
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
        <h1 className="text-xl font-semibold text-gray-900">Post not found</h1>
        <Link to="/admin/posts" className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline">
          ← Back to Posts
        </Link>
      </div>
    );
  }

  if (loadStatus === 'error') {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-700">Couldn't load this post.</p>
        <Link to="/admin/posts" className="mt-4 inline-block text-sm font-medium text-gray-900 hover:underline">
          ← Back to Posts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Edit Post</h1>
      <div className="mt-6">
        <PostForm
          mode="edit"
          initialData={post}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitError={submitError}
        />
      </div>
    </div>
  );
}