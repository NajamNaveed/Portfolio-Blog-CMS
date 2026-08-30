import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostForm from '../../components/admin/PostForm';
import { createPost } from '../../services/postService';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function CreatePost() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function handleSubmit(payload) {
    setSubmitting(true);
    setSubmitError('');
    try {
      // payload never includes `author` — the backend derives it from the
      // authenticated user's JWT (see Phase 3 postController.js).
      await createPost(payload);
      navigate('/admin/posts');
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Unable to save the post. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Create Post</h1>
      <div className="mt-6">
        <PostForm mode="create" onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />
      </div>
    </div>
  );
}