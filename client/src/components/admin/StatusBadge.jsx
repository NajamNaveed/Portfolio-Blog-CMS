export default function StatusBadge({ status }) {
  const isPublished = status === 'published';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isPublished ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600'
      }`}
    >
      {isPublished ? 'PUBLISHED' : 'DRAFT'}
    </span>
  );
}