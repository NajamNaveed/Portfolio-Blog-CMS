export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="animate-fade-in mx-auto max-w-md py-12 text-center">
      <p className="text-gray-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-900"
        >
          Try again
        </button>
      )}
    </div>
  );
}