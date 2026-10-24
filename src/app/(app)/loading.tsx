// Shown instantly while a page loads, so taps never feel ignored.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-xl bg-surface-2" />
      <div className="h-4 w-72 max-w-full rounded-lg bg-surface-2" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-3xl border border-line bg-surface" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-20 rounded-2xl border border-line bg-surface" />
      ))}
    </div>
  );
}
