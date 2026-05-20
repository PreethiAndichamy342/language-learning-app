export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  );
}
