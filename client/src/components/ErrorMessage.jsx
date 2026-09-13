export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="animate-fade-in mx-auto max-w-md py-12 text-center">
      <p className="opacity-70">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full border border-current/20 px-5 py-2 text-sm font-medium transition-colors hover:border-current/50 focus-visible:ring-2 focus-visible:ring-current"
        >
          Try again
        </button>
      )}
    </div>
  );
}
