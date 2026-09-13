import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getAdminMessages, updateMessageStatus, deleteMessage } from '../../services/messageService';

const STATUS_STYLES = {
  new: 'bg-gray-900 text-white',
  read: 'border border-gray-300 text-gray-600',
  replied: 'bg-green-100 text-green-800',
};

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [actionError, setActionError] = useState('');
  const [active, setActive] = useState(null);

  async function fetchMessages() {
    setStatus('loading');
    try {
      const data = await getAdminMessages({ limit: 50 });
      setMessages(data.messages);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function openMessage(message) {
    setActive(message);
    if (message.status === 'new') {
      try {
        await updateMessageStatus(message._id, 'read');
        setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, status: 'read' } : m)));
      } catch {
        // Non-critical — the message still opens even if the status update fails.
      }
    }
  }

  async function handleStatusChange(message, nextStatus) {
    setActionError('');
    try {
      await updateMessageStatus(message._id, nextStatus);
      setMessages((prev) => prev.map((m) => (m._id === message._id ? { ...m, status: nextStatus } : m)));
      setActive((prev) => (prev && prev._id === message._id ? { ...prev, status: nextStatus } : prev));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to update this message.'));
    }
  }

  async function handleDelete(message) {
    const confirmed = window.confirm(`Delete the message from ${message.name}?`);
    if (!confirmed) return;
    setActionError('');
    try {
      await deleteMessage(message._id);
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
      setActive(null);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to delete this message.'));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
      <p className="mt-1 text-sm text-gray-500">Submissions from your public Contact form.</p>

      {actionError && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="mt-6">
        {status === 'loading' && <LoadingSpinner />}
        {status === 'error' && <ErrorMessage message="Couldn't load messages." onRetry={fetchMessages} />}
        {status === 'success' && messages.length === 0 && <EmptyState message="No messages yet." />}

        {status === 'success' && messages.length > 0 && (
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {messages.map((message) => (
              <button
                key={message._id}
                type="button"
                onClick={() => openMessage(message)}
                className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-gray-900">{message.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_STYLES[message.status]}`}>
                      {message.status}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-500">{message.subject || message.message}</p>
                </div>
                <p className="shrink-0 text-xs text-gray-400">{formatDate(message.createdAt)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal open={Boolean(active)} onClose={() => setActive(null)} labelledBy="message-modal-title" variant="light">
        {active && (
          <div>
            <h3 id="message-modal-title" className="text-lg font-semibold text-gray-900">
              {active.subject || 'Message'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              From <span className="font-medium text-gray-700">{active.name}</span> ·{' '}
              <a href={`mailto:${active.email}`} className="text-gray-700 underline">{active.email}</a>
            </p>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-700">{active.message}</p>
            <p className="mt-4 text-xs text-gray-400">Received {formatDate(active.createdAt)}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`mailto:${active.email}`}
                onClick={() => handleStatusChange(active, 'replied')}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Reply by Email
              </a>
              {active.status !== 'replied' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(active, 'replied')}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Mark Replied
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(active)}
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
