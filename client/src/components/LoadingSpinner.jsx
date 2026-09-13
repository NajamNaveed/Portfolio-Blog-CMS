export default function LoadingSpinner() {
  return (
    <div className="animate-fade-in flex items-center justify-center py-16" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current/20 border-t-current" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
