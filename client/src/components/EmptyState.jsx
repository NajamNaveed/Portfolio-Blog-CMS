export default function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="animate-fade-in mx-auto max-w-md py-16 text-center">
      <p className="text-sm opacity-60">{message}</p>
    </div>
  );
}
